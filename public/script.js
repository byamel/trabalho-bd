const formPaciente = document.getElementById("formPaciente");

const listaPacientes =
    document.getElementById("listaPacientes");

const mensagem =
    document.getElementById("mensagemPaciente");

const tituloFormulario =
    document.getElementById("tituloFormularioPaciente");

const botaoFormulario =
    document.getElementById("botaoPaciente");

const botaoCancelar =
    document.getElementById("botaoCancelarEdicao");


let pacienteEditando = null;




formPaciente.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;
    const data_nascimento =
        document.getElementById("data_nascimento").value;

    try {

        // ========================
        // EDITANDO PACIENTE
        // ========================

        if (pacienteEditando !== null) {

            const resposta = await fetch(
                `/pacientes/${pacienteEditando}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome,
                        cpf,
                        telefone,
                        data_nascimento
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                mensagem.textContent =
                    dados.mensagem || "Erro ao atualizar paciente.";
                return;
            }

            mensagem.textContent =
                "Paciente atualizado com sucesso!";

            // Sai do modo edição
            pacienteEditando = null;

            // Limpa formulário
            formPaciente.reset();

            // Volta título e botão ao normal
            tituloFormulario.textContent =
                "Cadastrar paciente";

            botaoFormulario.textContent =
                "Cadastrar paciente";

            botaoCancelar.style.display =
                "none";

            // Atualiza a lista SEM atualizar a página
            await carregarPacientes();

            return;
        }


        // ========================
        // CADASTRANDO PACIENTE
        // ========================

        const resposta = await fetch(
            "/pacientes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    cpf,
                    telefone,
                    data_nascimento
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            mensagem.textContent =
                dados.mensagem || "Erro ao cadastrar paciente.";

            return;
        }

        mensagem.textContent =
            "Paciente cadastrado com sucesso!";

        // Limpa o formulário
        formPaciente.reset();

        // ATUALIZA A LISTA AUTOMATICAMENTE
        await carregarPacientes();

    } catch (erro) {

        console.error(
            "Erro no formulário de paciente:",
            erro
        );

        mensagem.textContent =
            "Erro de comunicação com o servidor.";
    }

});

// ========================
// LISTAR PACIENTES
// ========================

async function carregarPacientes() {

    try {

        const resposta = await fetch("/pacientes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar pacientes");
        }

        const pacientes = await resposta.json();

        listaPacientes.innerHTML = "";

        pacientes.forEach((paciente) => {

            const div = document.createElement("div");

            div.innerHTML = `
                <h3>${paciente.nome}</h3>

                <p>CPF: ${paciente.cpf}</p>

                <p>Telefone: ${paciente.telefone}</p>

                <p>Data de nascimento: ${paciente.data_nascimento}</p>

                <button onclick="editarPaciente(${paciente.id})">
                    Editar
                </button>

                <button onclick="excluirPaciente(${paciente.id})">
                    Excluir
                </button>

                <hr>
            `;

            listaPacientes.appendChild(div);
        });

    } catch (erro) {

        console.error("Erro ao carregar pacientes:", erro);

        listaPacientes.innerHTML = `
            <p>Erro ao carregar os pacientes.</p>
        `;
    }
}


// ========================
// COMEÇAR EDIÇÃO
// ========================

async function editarPaciente(id) {

    try {

        const resposta = await fetch("/pacientes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar pacientes.");
        }

        const pacientes = await resposta.json();

        const paciente = pacientes.find(
            (p) => p.id === id
        );

        if (!paciente) {
            alert("Paciente não encontrado.");
            return;
        }

        document.getElementById("nome").value =
            paciente.nome;

        document.getElementById("cpf").value =
            paciente.cpf;

        document.getElementById("telefone").value =
            paciente.telefone;

        document.getElementById("data_nascimento").value =
            paciente.data_nascimento;

        pacienteEditando = id;

        tituloFormulario.textContent =
            "Editar paciente";

        botaoFormulario.textContent =
            "Salvar alterações";

        botaoCancelar.style.display =
            "inline-block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (erro) {

        console.error(
            "Erro ao editar paciente:",
            erro
        );

        alert("Erro ao carregar o paciente.");
    }
}

window.editarPaciente = editarPaciente;

// ========================
// CANCELAR EDIÇÃO
// ========================

function cancelarEdicao() {

    pacienteEditando = null;

    formPaciente.reset();

    tituloFormulario.textContent =
        "Cadastrar paciente";

    botaoFormulario.textContent =
        "Cadastrar paciente";

    botaoCancelar.style.display =
        "none";
}


// ========================
// EXCLUIR PACIENTE
// ========================

async function excluirPaciente(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este paciente?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(`/pacientes/${id}`, {
            method: "DELETE"
        });

        const dados = await resposta.json();

        console.log("Resposta da exclusão:", dados);

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao excluir paciente.");
            return;
        }

        alert(dados.mensagem);

        carregarPacientes();

    } catch (erro) {

        console.error("Erro ao excluir paciente:", erro);

        alert("Erro de comunicação com o servidor.");
    }
}

window.excluirPaciente = excluirPaciente;

// ========================
// DISPONIBILIZAR FUNÇÕES PARA OS BOTÕES
// ========================

window.editarPaciente = editarPaciente;
window.excluirPaciente = excluirPaciente;


// ========================
// CARREGAR PACIENTES AO ABRIR
// ========================

carregarPacientes();

// =========================
// MÉDICOS
// =========================

const formMedico = document.getElementById("formMedico");

const listaMedicos = document.getElementById("listaMedicos");

const mensagemMedico = document.getElementById("mensagemMedico");

let medicoEditando = null;

// ========================
// CADASTRAR / EDITAR MÉDICO
// ========================

formMedico.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome =
        document.getElementById("nomeMedico").value;

    const crm =
        document.getElementById("crm").value;

    const especialidade =
        document.getElementById("especialidade").value;

    try {

        // ========================
        // EDITANDO
        // ========================

        if (medicoEditando !== null) {

            const resposta = await fetch(
                `/medicos/${medicoEditando}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome,
                        crm,
                        especialidade
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                mensagemMedico.textContent =
                    dados.mensagem ||
                    "Erro ao atualizar médico.";

                return;
            }

            mensagemMedico.textContent =
                "Médico atualizado com sucesso!";

            medicoEditando = null;

            formMedico.reset();

            const botao =
                document.getElementById("botaoMedico");

            const titulo =
                document.getElementById("tituloFormularioMedico");

            const cancelar =
                document.getElementById("botaoCancelarMedico");

            if (titulo) {
                titulo.textContent =
                    "Cadastrar médico";
            }

            if (botao) {
                botao.textContent =
                    "Cadastrar médico";
            }

            if (cancelar) {
                cancelar.style.display =
                    "none";
            }

            await carregarMedicos();

            return;
        }


        // ========================
        // CADASTRANDO
        // ========================

        const resposta = await fetch(
            "/medicos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    crm,
                    especialidade
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            mensagemMedico.textContent =
                dados.mensagem ||
                "Erro ao cadastrar médico.";

            return;
        }

        mensagemMedico.textContent =
            "Médico cadastrado com sucesso!";

        formMedico.reset();

        // Atualiza a lista automaticamente
        await carregarMedicos();

    } catch (erro) {

        console.error(
            "Erro no formulário de médico:",
            erro
        );

        mensagemMedico.textContent =
            "Erro de comunicação com o servidor.";
    }

});

// ========================
// LISTAR MÉDICOS
// ========================

async function carregarMedicos() {

    try {

        const resposta =
            await fetch("/medicos");

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar médicos."
            );
        }

        const medicos =
            await resposta.json();

        listaMedicos.innerHTML = "";

        medicos.forEach((medico) => {

            const div =
                document.createElement("div");

            div.innerHTML = `
                <h3>${medico.nome}</h3>

                <p>CRM: ${medico.crm}</p>

                <p>
                    Especialidade:
                    ${medico.especialidade}
                </p>

                <button
                    onclick="editarMedico(${medico.id})">
                    Editar
                </button>

                <button
                    onclick="excluirMedico(${medico.id})">
                    Excluir
                </button>

                <hr>
            `;

            listaMedicos.appendChild(div);

        });

    } catch (erro) {

        console.error(
            "Erro ao carregar médicos:",
            erro
        );

        listaMedicos.innerHTML = `
            <p>Erro ao carregar médicos.</p>
        `;
    }
}

// ========================
// EDITAR MÉDICO
// ========================

async function editarMedico(id) {

    try {

        const resposta =
            await fetch("/medicos");

        const medicos =
            await resposta.json();

        const medico =
            medicos.find(
                (m) => m.id === id
            );

        if (!medico) {

            alert("Médico não encontrado.");

            return;
        }

        document.getElementById("nomeMedico").value =
            medico.nome;

        document.getElementById("crm").value =
            medico.crm;

        document.getElementById("especialidade").value =
            medico.especialidade;

        medicoEditando = id;

        const titulo =
            document.getElementById(
                "tituloFormularioMedico"
            );

        const botao =
            document.getElementById(
                "botaoMedico"
            );

        const cancelar =
            document.getElementById(
                "botaoCancelarMedico"
            );

        if (titulo) {
            titulo.textContent =
                "Editar médico";
        }

        if (botao) {
            botao.textContent =
                "Salvar alterações";
        }

        if (cancelar) {
            cancelar.style.display =
                "inline-block";
        }

        document.getElementById("formMedico").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (erro) {

        console.error(
            "Erro ao editar médico:",
            erro
        );

        alert(
            "Erro ao carregar o médico."
        );
    }
}

window.editarMedico = editarMedico;


// ========================
// CANCELAR EDIÇÃO DO MÉDICO
// ========================

function cancelarEdicaoMedico() {

    medicoEditando = null;

    formMedico.reset();

    document.getElementById(
        "tituloFormularioMedico"
    ).textContent = "Cadastrar médico";

    document.getElementById(
        "botaoMedico"
    ).textContent = "Cadastrar médico";

    document.getElementById(
        "botaoCancelarMedico"
    ).style.display = "none";
}

window.cancelarEdicaoMedico =
    cancelarEdicaoMedico;


// ========================
// EXCLUIR MÉDICO
// ========================

async function excluirMedico(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este médico?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `/medicos/${id}`,
            {
                method: "DELETE"
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            alert(
                dados.mensagem ||
                "Erro ao excluir médico."
            );

            return;
        }

        alert(dados.mensagem);

        // Atualiza a lista sem recarregar a página
        await carregarMedicos();

        // Atualiza também o select de médicos
        await carregarMedicosConsulta();

    } catch (erro) {

        console.error(
            "Erro ao excluir médico:",
            erro
        );

        alert(
            "Erro de comunicação com o servidor."
        );
    }
}

window.excluirMedico = excluirMedico;


// =========================
// CONSULTAS
// =========================

const formConsulta =
    document.getElementById("formConsulta");

const pacienteConsulta =
    document.getElementById("pacienteConsulta");

const medicoConsulta =
    document.getElementById("medicoConsulta");

const mensagemConsulta =
    document.getElementById("mensagemConsulta");


// =========================
// CARREGAR PACIENTES NO SELECT
// =========================

async function carregarPacientesConsulta() {

    const resposta = await fetch("/pacientes");

    const pacientes = await resposta.json();

    pacienteConsulta.innerHTML = `
        <option value="">
            Selecione um paciente
        </option>
    `;

    pacientes.forEach((paciente) => {

        const option = document.createElement("option");

        option.value = paciente.id;

        option.textContent = paciente.nome;

        pacienteConsulta.appendChild(option);
    });
}


// =========================
// CARREGAR MÉDICOS NO SELECT
// =========================

async function carregarMedicosConsulta() {

    const resposta = await fetch("/medicos");

    const medicos = await resposta.json();

    medicoConsulta.innerHTML = `
        <option value="">
            Selecione um médico
        </option>
    `;

    medicos.forEach((medico) => {

        const option = document.createElement("option");

        option.value = medico.id;

        option.textContent =
            `${medico.nome} - ${medico.especialidade}`;

        medicoConsulta.appendChild(option);
    });
}


// =========================
// AGENDAR CONSULTA
// =========================

formConsulta.addEventListener("submit", async (event) => {

    event.preventDefault();

    const paciente_id =
        pacienteConsulta.value;

    const medico_id =
        medicoConsulta.value;

    const data =
        document.getElementById("dataConsulta").value;

    const horario =
        document.getElementById("horarioConsulta").value;


    const resposta = await fetch("/consultas", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            paciente_id,
            medico_id,
            data,
            horario

        })
    });


    const dados = await resposta.json();


    mensagemConsulta.textContent =
        dados.mensagem;


    if (resposta.ok) {

        formConsulta.reset();

        carregarConsultas();
    }

});


// =========================
// CARREGAR CONSULTAS
// =========================

async function carregarConsultas() {

    const resposta =
        await fetch("/consultas");

    const consultas =
        await resposta.json();


    const lista =
        document.getElementById("listaConsultas");


    lista.innerHTML = "";


    consultas.forEach((consulta) => {

        const div =
            document.createElement("div");


        div.innerHTML = `

            <h3>
                ${consulta.paciente}
            </h3>

            <p>
                Médico: ${consulta.medico}
            </p>

            <p>
                Especialidade: ${consulta.especialidade}
            </p>

            <p>
                Data: ${consulta.data}
            </p>

            <p>
                Horário: ${consulta.horario}
            </p>

            <p>
                Status: ${consulta.status}
            </p>


            ${
                consulta.status === "agendada"
                ? `

                    <button
                        onclick="alterarConsulta(${consulta.id})"
                    >
                        Alterar data/horário
                    </button>


                    <button
                        onclick="cancelarConsulta(${consulta.id})"
                    >
                        Cancelar consulta
                    </button>

                `
                : ""
            }


            <hr>

        `;


        lista.appendChild(div);

    });

}


async function alterarConsulta(id) {

    const novaData = prompt(
        "Digite a nova data (AAAA-MM-DD):"
    );

    if (!novaData) {
        return;
    }

    const novoHorario = prompt(
        "Digite o novo horário (HH:MM):"
    );

    if (!novoHorario) {
        return;
    }

    console.log("ID da consulta:", id);
    console.log("Nova data:", novaData);
    console.log("Novo horário:", novoHorario);

    try {

        const resposta = await fetch(`/consultas/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                data: novaData,
                horario: novoHorario
            })

        });

        console.log("Status da resposta:", resposta.status);

        const dados = await resposta.json();

        console.log("Resposta do servidor:", dados);

        alert(dados.mensagem);

        if (resposta.ok) {

            carregarConsultas();

        }

    } catch (erro) {

        console.error(
            "Erro ao alterar consulta:",
            erro
        );

        alert(
            "Erro ao alterar a consulta."
        );

    }
}

async function excluirMedico(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este médico?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta =
            await fetch(
                `/medicos/${id}`,
                {
                    method: "DELETE"
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                dados.mensagem ||
                "Erro ao excluir médico."
            );

            return;
        }

        alert(dados.mensagem);

        await carregarMedicos();

    } catch (erro) {

        console.error(
            "Erro ao excluir médico:",
            erro
        );

        alert(
            "Erro de comunicação com o servidor."
        );
    }
}

window.excluirMedico = excluirMedico;


// =========================
// CANCELAR CONSULTA
// =========================

async function cancelarConsulta(id) {


    const confirmar = confirm(
        "Tem certeza que deseja cancelar esta consulta?"
    );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(`/consultas/${id}`, {

                method: "DELETE"

            });


        const dados =
            await resposta.json();


        alert(dados.mensagem);


        if (resposta.ok) {

            carregarConsultas();

        }


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao cancelar a consulta."
        );

    }

}


// =========================
// INICIALIZAÇÃO
// =========================

carregarPacientesConsulta();

carregarMedicosConsulta();

carregarConsultas();

carregarMedicos();


// =========================
// DISPONIBILIZAR FUNÇÕES
// PARA OS BOTÕES DO HTML
// =========================

window.alterarConsulta =
    alterarConsulta;

window.cancelarConsulta =
    cancelarConsulta;