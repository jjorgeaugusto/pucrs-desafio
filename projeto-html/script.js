document.addEventListener('DOMContentLoaded', function () {
  const listaDia = document.getElementById('listaDia');
  const inputDia = document.createElement('input');
  inputDia.placeholder = 'Nova tarefa do dia';
  const btnAddDia = document.createElement('button');
  btnAddDia.textContent = 'Adicionar';
  btnAddDia.addEventListener('click', function () {
    adicionarTarefa(inputDia, listaDia);
  });

  const listaNoite = document.getElementById('listaNoite');
  const inputNoite = document.createElement('input');
  inputNoite.placeholder = 'Nova tarefa da noite';
  const btnAddNoite = document.createElement('button');
  btnAddNoite.textContent = 'Adicionar';
  btnAddNoite.addEventListener('click', function () {
    adicionarTarefa(inputNoite, listaNoite);
  });

  function adicionarTarefa(input, lista) {
    if (input.value.trim() !== '') {
      const novaTarefa = document.createElement('li');
      novaTarefa.textContent = input.value;
      const btnRemover = document.createElement('button');
      btnRemover.textContent = 'Remover';
      btnRemover.addEventListener('click', function () {
        lista.removeChild(novaTarefa);
      });
      novaTarefa.appendChild(btnRemover);
      lista.appendChild(novaTarefa);
      input.value = '';
    }
  }

  document.getElementById('tarefasDia').appendChild(inputDia);
  document.getElementById('tarefasDia').appendChild(btnAddDia);
  document.getElementById('tarefasNoite').appendChild(inputNoite);
  document.getElementById('tarefasNoite').appendChild(btnAddNoite);

  listaDia.style.display = 'block';
  listaNoite.style.display = 'block';
});