"""Cada exercício do site: as soluções passam, o código inicial não, e os ids são únicos.
O código inicial corre num processo à parte com o limite de tempo do site (6 s): nos exercícios de eficiência,
a versão lenta tem de falhar por tempo, como acontece no browser."""
import json, multiprocessing as mp
import pytest
from corretor import corrigir, exercicios

EXS = exercicios()
LIMITE = 6


def _corre(code, testes, proibido, q):
    q.put(corrigir(code, testes, proibido))


def corrigir_com_tempo(code, testes, proibido):
    q = mp.Queue()
    p = mp.Process(target=_corre, args=(code, testes, proibido, q))
    p.start(); p.join(LIMITE)
    if p.is_alive():
        p.terminate(); p.join()
        return {'ok': False, 'timeout': True}
    return q.get()


def test_ha_exercicios():
    assert len(EXS) >= 20


def test_ids_unicos():
    ids = [e['id'] for _, e in EXS]
    assert len(ids) == len(set(ids)), [i for i in ids if ids.count(i) > 1]


@pytest.mark.parametrize('ficheiro,ex', EXS, ids=[e['id'] for _, e in EXS])
def test_exercicio(ficheiro, ex):
    assert ex['titulo'] and ex['enunciado'] and ex['testes'] and ex['solucao'], f'{ficheiro}: falta título, enunciado, testes ou solução'
    r = corrigir_com_tempo(ex['solucao'], ex['testes'], ex['proibido'])
    assert r['ok'], f"{ficheiro} {ex['id']}: a solução não passa: {json.dumps(r, ensure_ascii=False)[:500]}"
    r0 = corrigir_com_tempo(ex['inicio'], ex['testes'], ex['proibido'])
    assert not r0['ok'], f"{ficheiro} {ex['id']}: o código inicial já passa em todos os testes"
