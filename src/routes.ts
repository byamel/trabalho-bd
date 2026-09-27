import { Router } from "express";
import db from "./database";

const routes = Router();


// ========================
// PACIENTES
// ========================

routes.post("/pacientes", (req, res) => {

    const {
        nome,
        cpf,
        telefone,
        data_nascimento
    } = req.body;

    try {

        const resultado = db.prepare(`
            INSERT INTO pacientes
            (nome, cpf, telefone, data_nascimento)
            VALUES (?, ?, ?, ?)
        `).run(
            nome,
            cpf,
            telefone,
            data_nascimento
        );

        res.status(201).json({
            mensagem: "Paciente cadastrado com sucesso",
            id: resultado.lastInsertRowid
        });

    } catch (erro: any) {

        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(400).json({
                mensagem: "Este CPF já está cadastrado."
            });

        }

        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar paciente."
        });
    }
});

routes.get("/pacientes", (req, res) => {

    const pacientes = db.prepare(`
        SELECT * FROM pacientes
    `).all();

    res.json(pacientes);

});

routes.put("/pacientes/:id", (req, res) => {

    const { id } = req.params;
    const { nome, cpf, telefone, data_nascimento } = req.body;

    const resultado = db.prepare(`
        UPDATE pacientes
        SET nome = ?,
            cpf = ?,
            telefone = ?,
            data_nascimento = ?
        WHERE id = ?
    `).run(nome, cpf, telefone, data_nascimento, id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensagem: "Paciente não encontrado"
        });
    }

    res.json({
        mensagem: "Paciente atualizado com sucesso"
    });
});

routes.delete("/pacientes/:id", (req, res) => {

    const { id } = req.params;

    try {

        // Verifica se o paciente existe
        const paciente = db.prepare(`
            SELECT id
            FROM pacientes
            WHERE id = ?
        `).get(id);

        if (!paciente) {
            return res.status(404).json({
                mensagem: "Paciente não encontrado"
            });
        }

        // Verifica somente consultas ATIVAS
        const consultaAtiva = db.prepare(`
            SELECT id
            FROM consultas
            WHERE paciente_id = ?
            AND status = 'agendada'
        `).get(id);

        if (consultaAtiva) {
            return res.status(400).json({
                mensagem: "Não é possível excluir este paciente porque ele possui uma consulta agendada."
            });
        }

        // Exclui consultas canceladas antigas
        db.prepare(`
            DELETE FROM consultas
            WHERE paciente_id = ?
            AND status = 'cancelada'
        `).run(id);

        // Exclui o paciente
        db.prepare(`
            DELETE FROM pacientes
            WHERE id = ?
        `).run(id);

        res.json({
            mensagem: "Paciente excluído com sucesso"
        });

    } catch (erro) {

        console.error("Erro ao excluir paciente:", erro);

        res.status(500).json({
            mensagem: "Erro ao excluir paciente."
        });
    }
});

// ========================
// MÉDICOS
// ========================

routes.post("/medicos", (req, res) => {
    const { nome, crm, especialidade } = req.body;

    const resultado = db.prepare(`
        INSERT INTO medicos
        (nome, crm, especialidade)
        VALUES (?, ?, ?)
    `).run(nome, crm, especialidade);

    res.status(201).json({
        mensagem: "Médico cadastrado com sucesso",
        id: resultado.lastInsertRowid
    });
});

routes.get("/medicos", (req, res) => {

    const medicos = db.prepare(`
        SELECT * FROM medicos
    `).all();

    res.json(medicos);

});

// =========================
// AGENDAR CONSULTA
// =========================

routes.post("/consultas", (req, res) => {

    const {
        paciente_id,
        medico_id,
        data,
        horario
    } = req.body;


    // Verificar se o paciente existe
    const paciente = db.prepare(`
        SELECT * FROM pacientes
        WHERE id = ?
    `).get(paciente_id);


    if (!paciente) {
        return res.status(404).json({
            mensagem: "Paciente não encontrado"
        });
    }


    // Verificar se o médico existe
    const medico = db.prepare(`
        SELECT * FROM medicos
        WHERE id = ?
    `).get(medico_id);


    if (!medico) {
        return res.status(404).json({
            mensagem: "Médico não encontrado"
        });
    }


    // Verificar se o médico já possui consulta nesse horário
    const consultaExistente = db.prepare(`
        SELECT * FROM consultas
        WHERE medico_id = ?
        AND data = ?
        AND horario = ?
        AND status = 'agendada'
    `).get(medico_id, data, horario);


    if (consultaExistente) {
        return res.status(400).json({
            mensagem: "O médico já possui uma consulta nesse horário"
        });
    }


    // Criar consulta
    const resultado = db.prepare(`
        INSERT INTO consultas
        (paciente_id, medico_id, data, horario, status)
        VALUES (?, ?, ?, ?, 'agendada')
    `).run(
        paciente_id,
        medico_id,
        data,
        horario
    );


    res.status(201).json({
        mensagem: "Consulta agendada com sucesso",
        id: resultado.lastInsertRowid
    });

});

// =========================
// CONSULTAR CONSULTAS
// =========================

routes.get("/consultas", (req, res) => {

    const consultas = db.prepare(`
        SELECT
            consultas.id,
            pacientes.nome AS paciente,
            medicos.nome AS medico,
            medicos.especialidade,
            consultas.data,
            consultas.horario,
            consultas.status

        FROM consultas

        INNER JOIN pacientes
            ON consultas.paciente_id = pacientes.id

        INNER JOIN medicos
            ON consultas.medico_id = medicos.id

        ORDER BY consultas.data, consultas.horario
    `).all();


    res.json(consultas);

});

// =========================
// ALTERAR CONSULTA
// =========================

routes.put("/consultas/:id", (req, res) => {

    const { id } = req.params;

    const { data, horario } = req.body;


    const consulta = db.prepare(`
        SELECT *
        FROM consultas
        WHERE id = ?
    `).get(id) as {
        id: number;
        paciente_id: number;
        medico_id: number;
        data: string;
        horario: string;
        status: string;
    } | undefined;


    if (!consulta) {

        return res.status(404).json({
            mensagem: "Consulta não encontrada"
        });

    }


    // Verificar se existe conflito de horário

    const conflito = db.prepare(`
        SELECT *
        FROM consultas

        WHERE medico_id = ?

        AND data = ?

        AND horario = ?

        AND status = 'agendada'

        AND id != ?
    `).get(
        consulta.medico_id,
        data,
        horario,
        id
    );


    if (conflito) {

        return res.status(400).json({
            mensagem:
                "O médico já possui outra consulta nesse horário"
        });

    }


    // Alterar data e horário

    db.prepare(`
        UPDATE consultas

        SET data = ?,
            horario = ?

        WHERE id = ?
    `).run(
        data,
        horario,
        id
    );


    res.json({
        mensagem:
            "Consulta alterada com sucesso"
    });

});


// =========================
// CANCELAR CONSULTA
// =========================

routes.delete("/consultas/:id", (req, res) => {

    const { id } = req.params;


    const consulta = db.prepare(`
        SELECT *
        FROM consultas
        WHERE id = ?
    `).get(id) as {
        id: number;
        paciente_id: number;
        medico_id: number;
        data: string;
        horario: string;
        status: string;
    } | undefined;


    if (!consulta) {

        return res.status(404).json({
            mensagem: "Consulta não encontrada"
        });

    }


    if (consulta.status === "cancelada") {

        return res.status(400).json({
            mensagem:
                "Esta consulta já foi cancelada"
        });

    }


    db.prepare(`
        UPDATE consultas

        SET status = 'cancelada'

        WHERE id = ?
    `).run(id);


    res.json({
        mensagem:
            "Consulta cancelada com sucesso"
    });

});


export default routes;