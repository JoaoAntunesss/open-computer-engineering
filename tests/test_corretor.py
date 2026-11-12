"""Testes do corretor: o que acontece com código certo, errado, com erros e com atalhos proibidos."""
from corretor import corrigir


def test_codigo_certo_passa_em_todos():
    r = corrigir('def dobro(x):\n    return 2 * x\n', ['dobro(2) == 4', 'dobro(-3) == -6'])
    assert r['ok'] and r['erro'] is None and len(r['testes']) == 2


def test_codigo_errado_mostra_obtido_e_esperado():
    r = corrigir('def dobro(x):\n    return x + 2\n', ['dobro(2) == 4', 'dobro(5) == 10'])
    assert not r['ok']
    assert r['testes'][0]['ok'] and not r['testes'][1]['ok']
    assert r['testes'][1]['chamada'] == 'dobro(5)'
    assert r['testes'][1]['obtido'] == '7' and r['testes'][1]['esperado'] == '10'


def test_erro_de_sintaxe_indica_a_linha():
    r = corrigir('def f(x)\n    return x\n', ['f(1) == 1'])
    assert not r['ok'] and r['erro']['tipo'] == 'SyntaxError' and r['erro']['linha'] == 1


def test_erro_num_teste_nao_esconde_os_outros():
    r = corrigir('def inverso(x):\n    return 1 / x\n', ['inverso(0) == 0', 'inverso(2) == 0.5'])
    assert not r['ok']
    assert r['testes'][0]['erro']['tipo'] == 'ZeroDivisionError' and r['testes'][0]['erro']['linha'] == 2
    assert r['testes'][1]['ok']


def test_erro_ao_carregar_o_codigo():
    r = corrigir('x = 1 / 0\n', ['True'])
    assert not r['ok'] and r['erro']['tipo'] == 'ZeroDivisionError' and r['testes'] == []


def test_nomes_proibidos():
    r = corrigir('def maior(a, b):\n    return max(a, b)\n', ['maior(1, 2) == 2'], ['max'])
    assert not r['ok'] and r['erro'] == {'tipo': 'Proibido', 'nomes': ['max']}


def test_metodo_proibido():
    r = corrigir('def ordena(xs):\n    xs.sort()\n    return xs\n', ['ordena([2, 1]) == [1, 2]'], ['sort'])
    assert r['erro']['nomes'] == ['sort']


def test_ciclos_proibidos_em_recursao():
    r = corrigir('def f(n):\n    t = 1\n    for i in range(n):\n        t *= i + 1\n    return t\n', ['f(3) == 6'], ['for', 'while'])
    assert r['erro']['nomes'] == ['for']


def test_print_e_capturado():
    r = corrigir('print("olá")\ndef f():\n    return 1\n', ['f() == 1'])
    assert r['ok'] and r['stdout'] == 'olá\n'


def test_decimais_com_tolerancia():
    assert corrigir('def f():\n    return 0.1 + 0.2\n', ['f() == 0.3'])['ok']


def test_teste_sem_comparacao():
    r = corrigir('def par(n):\n    return n % 2 == 0\n', ['par(4)', 'not par(3)'])
    assert r['ok']


def test_sem_testes_nao_conta_como_resolvido():
    assert not corrigir('x = 1\n', [])['ok']


def test_recursao_infinita_e_apanhada():
    r = corrigir('def f(n):\n    return f(n + 1)\n', ['f(0) == 0'])
    assert not r['ok'] and r['testes'][0]['erro']['tipo'] == 'RecursionError'
