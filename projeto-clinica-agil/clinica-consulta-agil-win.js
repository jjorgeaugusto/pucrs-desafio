const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const databaseFile = 'clinica.json';

let pacientesCadastrados = [];
let consultasAgendadas = [];

function carregarDados() {
  try {
    const data = fs.readFileSync(databaseFile);
    const jsonData = JSON.parse(data);

    pacientesCadastrados = jsonData.pacientes || [];
    consultasAgendadas = jsonData.consultas
      ? jsonData.consultas.map(carregarConsulta)
      : [];
  } catch (error) {
    console.error('Erro ao carregar dados:', error.message);
  }
}

function salvarDados() {
  const jsonData = {
    pacientes: pacientesCadastrados,
    consultas: consultasAgendadas.map(formatarConsultaParaSalvar)
  };

  console.log('Programa Finalizado!');

  try {
    fs.writeFileSync(databaseFile, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados:', error.message);
  }
}

function exibirMenuPrincipal() {
  console.log('\n--- Clínica de Consultas Ágil ---');
  console.log('1. Cadastrar Paciente');
  console.log('2. Marcar Consulta');
  console.log('3. Cancelar Consulta');
  console.log('4. Exibir Lista de Pacientes');
  console.log('5. Exibir Lista de Consultas');
  console.log('6. Sair');

  rl.question('Escolha uma opção: ', processarOpcaoMenu);
}

function processarOpcaoMenu(opcao) {
  switch (opcao) {
    case '1':
      cadastrarPaciente();
      break;
    case '2':
      marcarConsulta();
      break;
    case '3':
      cancelarConsulta();
      break;
    case '4':
      exibirListaPacientes();
      break;
    case '5':
      exibirListaConsultas();
      break;
    case '6':
      salvarDados();
      rl.close();
      break;
    default:
      console.log('Opção inválida. Tente novamente.');
      exibirMenuPrincipal();
  }
}

function exibirListaPacientes() {
  console.log('\n--- Lista de Pacientes ---');
  exibirPacientesCadastrados();
  exibirMenuPrincipal();
}

function exibirListaConsultas() {
  console.log('\n--- Lista de Consultas ---');
  exibirConsultasAgendadas();
  exibirMenuPrincipal();
}

function cadastrarPaciente() {
  console.log('\n--- Cadastro de Paciente ---');
  rl.question('Nome do paciente: ', (nome) => {
    rl.question('Telefone do paciente: ', (telefone) => {
      // verificar se tanto o nome quanto o telefone não estão vazios
      if (nome.trim() === '' || telefone.trim() === '') {
        console.log('Nome e telefone não podem ser vazios. Tente novamente.');
        cadastrarPaciente();  // chama a função novamente para novo cadastro
        return;
      }

      const pacienteExistente = pacientesCadastrados.find(p => p.telefone === telefone);

      if (pacienteExistente) {
        console.log('Paciente já cadastrado!');
      } else {
        const paciente = { nome, telefone };
        pacientesCadastrados.push(paciente);
        console.log('Paciente cadastrado com sucesso!');
      }

      exibirMenuPrincipal();
    });
  });
}

function marcarConsulta() {
  console.log('\n--- Marcação de Consulta ---');

  if (pacientesCadastrados.length === 0) {
    console.log('Não há pacientes cadastrados. Cadastre um paciente primeiro.');
    exibirMenuPrincipal();
    return;
  }

  exibirPacientesCadastrados();

  rl.question('Escolha o número do paciente: ', (pacienteIndex) => {
    const paciente = getPacienteSelecionado(pacienteIndex);

    if (!paciente) {
      console.log('Paciente não encontrado. Tente novamente.');
      marcarConsulta();
      return;
    }

    rl.question('Dia da consulta (DD/MM/YYYY): ', (dia) => {
      rl.question('Hora da consulta (HH:mm): ', (hora) => {
        rl.question('Especialidade desejada: ', (especialidade) => {
          const dataHoraConsulta = criarDataHoraConsulta(dia, hora);

          if (!dataHoraConsulta) {
            console.log('Formato de data ou hora inválido. Tente novamente.');
            marcarConsulta();
            return;
          }

          if (dataHoraConsulta <= new Date()) {
            console.log('Não é possível agendar consultas retroativas. Tente novamente.');
            marcarConsulta();
            return;
          }

          if (consultaExistente(paciente.telefone, dataHoraConsulta)) {
            console.log('Já há uma consulta agendada para esse paciente nesse horário. Tente novamente.');
          } else {
            const consulta = { paciente, dataHora: dataHoraConsulta, especialidade };
            consultasAgendadas.push(consulta);
            console.log('Consulta marcada com sucesso!');
          }

          exibirMenuPrincipal();
        });
      });
    });
  });
}

function exibirPacientesCadastrados() {
  console.log('Pacientes cadastrados:');
  pacientesCadastrados.forEach((paciente, index) => {
    console.log(`${index + 1}. ${paciente.nome}`);
  });
}

function getPacienteSelecionado(index) {
  return pacientesCadastrados[index - 1];
}

function criarDataHoraConsulta(dia, hora) {
  const [diaConsulta, mesConsulta, anoConsulta] = dia.split('/');
  const dataHoraConsulta = new Date(`${anoConsulta}-${mesConsulta}-${diaConsulta} ${hora}`);

  return isNaN(dataHoraConsulta.getTime()) ? null : dataHoraConsulta;
}

function consultaExistente(telefone, dataHora) {
  return consultasAgendadas.some(
    (consulta) =>
      consulta.paciente.telefone === telefone && consulta.dataHora && consulta.dataHora.getTime() === dataHora.getTime()
  );
}

function cancelarConsulta() {
  console.log('\n--- Cancelamento de Consulta ---');

  if (consultasAgendadas.length === 0) {
    console.log('Não há consultas agendadas.');
    exibirMenuPrincipal();
    return;
  }

  console.log('Consultas agendadas:');
  exibirConsultasAgendadas();

  rl.question('Escolha o número da consulta para cancelar: ', (consultaIndex) => {
    const consulta = consultasAgendadas[consultaIndex - 1];

    if (!consulta) {
      console.log('Consulta não encontrada. Tente novamente.');
      cancelarConsulta();
      return;
    }

    const pacienteNome = consulta.paciente ? consulta.paciente.nome : 'Paciente não encontrado';
    const dataHora = consulta.dataHora instanceof Date ? consulta.dataHora.toLocaleString() : 'Data/Hora não disponível';
    const especialidade = consulta.especialidade || 'Especialidade não disponível';

    console.log(`Consulta agendada para ${pacienteNome} em ${dataHora} na especialidade ${especialidade}`);

    rl.question('Deseja cancelar esta consulta? (S/N): ', (resposta) => {
      if (resposta.toUpperCase() === 'S') {
        consultasAgendadas.splice(consultaIndex - 1, 1);
        console.log('Consulta cancelada com sucesso!');
      } else {
        console.log('Operação cancelada.');
      }

      exibirMenuPrincipal();
    });
  });
}

function exibirConsultasAgendadas() {
  console.log('Consultas agendadas:');
  consultasAgendadas.forEach((consulta, index) => {
    const pacienteNome = consulta.paciente ? consulta.paciente.nome : 'Paciente não encontrado';
    const dataHora = consulta.dataHora instanceof Date ? consulta.dataHora.toLocaleString() : 'Data/Hora não disponível';
    const especialidade = consulta.especialidade || 'Especialidade não disponível';

    console.log(`${index + 1}. ${pacienteNome} - ${dataHora} - ${especialidade}`);
  });
}

function carregarConsulta(consulta) {
  return {
    paciente: consulta.paciente,
    dataHora: new Date(consulta.dataHora),
    especialidade: consulta.especialidade
  };
}

function formatarConsultaParaSalvar(consulta, index) {
  try {
    const dataHora = new Date(consulta.dataHora);
    if (!dataHora || isNaN(dataHora.getTime())) {
      console.error(`Consulta com índice ${index} possui dataHora inválida: ${consulta.dataHora}`);
      return {
        paciente: consulta.paciente,
        dataHora: null,
        especialidade: consulta.especialidade
      };
    }
    return {
      paciente: consulta.paciente,
      dataHora: dataHora.toISOString(),
      especialidade: consulta.especialidade
    };
  } catch (error) {
    console.error(`Erro ao processar a consulta com índice ${index}:`, error.message);
    return {
      paciente: consulta.paciente,
      dataHora: null,
      especialidade: consulta.especialidade
    };
  }
}

function iniciarPrograma() {
  carregarDados();
  exibirMenuPrincipal();
}

iniciarPrograma();