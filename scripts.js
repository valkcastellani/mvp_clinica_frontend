const abreFechaModal = () => {
  let sessionPaciente = document.getElementById("novoPaciente");
  let cpf = document.getElementById("cpf");
  let nome = document.getElementById("nome");
  let data_nascimento = document.getElementById("data_nascimento");
  let sexo = document.getElementById("sexo");
  let cep = document.getElementById("cep");
  let endereco = document.getElementById("endereco");
  let telefone = document.getElementById("telefone");
  let email = document.getElementById("email");

  if (sessionPaciente.classList.contains("modal-visible")) {
    sessionPaciente.classList.remove("modal-visible"); // Remove a classe "modal-visible"
  } else {
    sessionPaciente.classList.add("modal-visible"); // Adiciona a classe "modal-visible"
  }

  cpf.disabled = false;
  nome.disabled = false;
  data_nascimento.disabled = false;
  sexo.disabled = false;
  cep.disabled = false;
  endereco.disabled = false;
  telefone.disabled = false;
  email.disabled = false;
}

/*
  --------------------------------------------------------------------------------------
  Função para consultar um paciente da tabela e do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const consultarPaciente = (cpf, alterar) => {
  let url = 'http://127.0.0.1:5000/paciente?cpf=' + cpf;
  fetch(url, {
    method: 'get'
  }).then((response) => response.json())
    .then((data) => {
      abreFechaModal();

      let cpf = document.getElementById("cpf");
      let nome = document.getElementById("nome");
      let data_nascimento = document.getElementById("data_nascimento");
      let sexo = document.getElementById("sexo");
      let cep = document.getElementById("cep");
      let endereco = document.getElementById("endereco");
      let telefone = document.getElementById("telefone");
      let email = document.getElementById("email");

      cpf.value = formatarCPF(data.cpf);
      nome.value = data.nome;
      data_nascimento.value = new Date(data.data_nascimento).toISOString().substring(0, 10);
      sexo.value = data.sexo;
      cep.value = data.cep;
      endereco.value = data.endereco;
      telefone.value = data.telefone;
      email.value = data.email;

      cpf.disabled = true;
      nome.disabled = (!alterar);
      data_nascimento.disabled = (!alterar);
      sexo.disabled = (!alterar);
      cep.disabled = (!alterar);
      endereco.disabled = (!alterar);
      telefone.disabled = (!alterar);
      email.disabled = (!alterar);

      let botao = document.getElementById("botao_gravar");
      botao.style.display = (alterar) ? 'block' : 'none';
    })
    .catch((error) => {
      Swal.fire({
        title: 'Erro!',
        text: error,
        icon: 'error'
      })
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para deletar um paciente da tabela e do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const removerPaciente = (cpf, nome) => {
  Swal.fire({
    title: "Tem certeza?",
    text: "Você vai excluir o paciente " + nome + " portador do CPF " + cpf + "!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "var(--cor-button-confirm)",
    cancelButtonColor: "var(--cor-button-cancel)",
    confirmButtonText: "Sim, pode apagar!",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      let url = 'http://127.0.0.1:5000/paciente?cpf=' + cpf;
      fetch(url, {
        method: 'delete'
      })
        .then((response) => response.json())
        .then((data) => {
          let linhaTabela = document.getElementById(cpf);
          linhaTabela.remove();
          Swal.fire({
            title: "Excluído!",
            text: data.message,
            icon: "success"
          });
        })
        .catch((error) => {
          Swal.fire({
            title: 'Erro!',
            text: data.message,
            icon: 'error'
          })
        });
    }
  });
}


/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/pacientes';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.pacientes.forEach(paciente => insertList(paciente.cpf, paciente.nome,
        paciente.data_nascimento, paciente.telefone, paciente.email,
        paciente.data_insercao))
    })
    .catch((error) => {
      Swal.fire({
        title: 'Erro!',
        text: error,
        icon: 'error'
      })
    });
}


/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()


/*
  --------------------------------------------------------------------------------------
  Inclusão das mascaras dos dados
  --------------------------------------------------------------------------------------
*/
$(document).ready(function () {
  $('#cpf').mask('000.000.000-00', { reverse: true });
  $('#cep').mask('00000-000');
  $("#telefone").mask("(99) 9999-9999?9");
});

/*
  --------------------------------------------------------------------------------------
  Função para formatar o CPF
  --------------------------------------------------------------------------------------
*/
const formatarCPF = (cpf) => {
  // Remove tudo que não seja número
  let cpf_numerico = cpf.toString().replace(/\D/g, "");
  // Adiciona pontos e hífen
  return cpf_numerico.substr(0, 3) + "." + cpf_numerico.substr(3, 3) + "." + cpf_numerico.substr(6, 3) + "-" + cpf_numerico.substr(9, 2);
}


/*
  --------------------------------------------------------------------------------------
  Função para validar o CPF
  --------------------------------------------------------------------------------------
*/
function validarCPF(inputCPF) {
  let soma = 0;
  let resto;
  let cpf = inputCPF.value.toString().replace(/\D/g, "");

  if (cpf == '00000000000') return false;
  for (i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;

  if ((resto == 10) || (resto == 11)) resto = 0;
  if (resto != parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;

  if ((resto == 10) || (resto == 11)) resto = 0;
  if (resto != parseInt(cpf.substring(10, 11))) return false;
  return true;
}


/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const gravarPaciente = async () => {
  let cpf = document.getElementById("cpf");
  let nome = document.getElementById("nome");
  let data_nascimento = document.getElementById("data_nascimento");
  let sexo = document.getElementById("sexo");
  let cep = document.getElementById("cep");
  let endereco = document.getElementById("endereco");
  let telefone = document.getElementById("telefone");
  let email = document.getElementById("email");
  let mensagem = "";

  if (!validarCPF(cpf)) {
    mensagem += "O CPF do paciente informado é inválido! <br>";
  }
  if (!nome.value) {
    mensagem += "O nome do paciente está em branco! <br>"
  }
  if (!data_nascimento.value) {
    mensagem += "A data de nascimento do paciente está em branco! <br>"
  }
  if (mensagem != "") {
    Swal.fire({
      title: 'Erro!',
      html: mensagem,
      icon: 'error'
    })
  } else {
    const formData = new FormData();

    formData.append('cpf', cpf.value.toString().replace(/\D/g, ""));
    formData.append('nome', nome.value);
    formData.append('data_nascimento', data_nascimento.value);
    formData.append('sexo', sexo.value);
    formData.append('cep', cep.value.toString().replace(/\D/g, ""));
    formData.append('endereco', endereco.value);
    formData.append('telefone', telefone.value.toString().replace(/\D/g, ""));
    formData.append('email', email.value);

    let url = 'http://127.0.0.1:5000/paciente';
    fetch(url, {
      method: 'post',
      body: formData
    })
      .then((response) => response.json())
      .then(() => getList())
      .catch((error) => {
        Swal.fire({
          title: 'Erro!',
          text: error,
          icon: 'error'
        })
      });
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para criar botões: alterar, excluir e visualizar
  --------------------------------------------------------------------------------------
*/
const insertButtons = (parent, cpf, nome) => {
  let buttonAlterar = document.createElement("button");
  let iconAlterar = document.createElement("i");
  iconAlterar.className = "fa-solid fa-pencil";
  buttonAlterar.className = "button button-table";
  buttonAlterar.appendChild(iconAlterar);
  buttonAlterar.addEventListener("click", () => consultarPaciente(cpf, true));

  let buttonVisualizar = document.createElement("button");
  let iconVisualizar = document.createElement("i");
  iconVisualizar.className = "fa-solid fa-eye"
  buttonVisualizar.className = "button button-table";
  buttonVisualizar.appendChild(iconVisualizar);
  buttonVisualizar.addEventListener("click", () => consultarPaciente(cpf, false));

  let buttonExcluir = document.createElement("button");
  let iconExcluir = document.createElement("i");
  iconExcluir.className = "fa-solid fa-trash-can";
  buttonExcluir.className = "button button-table";
  buttonExcluir.appendChild(iconExcluir);
  buttonExcluir.addEventListener("click", () => removerPaciente(cpf, nome));

  parent.appendChild(buttonAlterar);
  parent.appendChild(buttonExcluir);
  parent.appendChild(buttonVisualizar);
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (cpf, nome, data_nascimento, telefone, email, data_insercao) => {
  const novaDataNascimento = new Date(data_nascimento).toLocaleDateString()
  const novaDataInsercao = new Date(data_insercao).toLocaleString('pt-BR');
  const cpfFormatado = formatarCPF(cpf).toString();
  var item = [cpfFormatado, nome, novaDataNascimento, telefone, email, novaDataInsercao]
  var table = document.getElementById('tabelaPacientes');
  var row = table.insertRow();
  row.id = cpf

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButtons(row.insertCell(-1), cpf, nome)
}