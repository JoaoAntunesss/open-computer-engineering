"""Carrega o corretor dos exercícios (o mesmo código Python que corre no browser, dentro de js/py-worker.js)
e os exercícios escritos nas lições (blocos ```exercicio em conteudo/). Usado pelos testes e pelo CI."""
import json, pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
_js = (RAIZ / 'js' / 'py-worker.js').read_text(encoding='utf-8')
HARNESS = _js.split('const HARNESS = `', 1)[1].split('`;', 1)[0]
_ns = {}
exec(HARNESS, _ns)


def corrigir(code, testes, proibido=()):
    """Corre o corretor como o browser: devolve o dicionário de resultado."""
    return json.loads(_ns['corrigir'](code, json.dumps(list(testes)), json.dumps(list(proibido))))


_CHAVE = re.compile(r'^(id|titulo|enunciado|dica|proibido|inicio|testes|solucao):\s?(.*)$')


def ler_exercicio(linhas):
    """A mesma leitura que parseEx() em js/app.js."""
    ex, cur = {}, None
    for l in linhas:
        m = _CHAVE.match(l)
        if m:
            cur = m[1]
            ex[cur] = [m[2]] if m[2] else []
        elif cur:
            ex[cur].append(l)
    um = lambda k: ' '.join(ex.get(k, [])).strip()
    bloco = lambda k: '\n'.join(ex.get(k, [])).strip('\n').rstrip()
    return {'id': um('id'), 'titulo': um('titulo'), 'enunciado': um('enunciado'),
            'proibido': [x for x in re.split(r'[,\s]+', um('proibido')) if x],
            'inicio': bloco('inicio') + '\n', 'testes': [x.strip() for x in ex.get('testes', []) if x.strip()],
            'solucao': bloco('solucao')}


def exercicios():
    """Todos os exercícios do site: [(ficheiro, exercício)]."""
    out = []
    for f in sorted((RAIZ / 'conteudo').rglob('*.md')):
        linhas = f.read_text(encoding='utf-8').split('\n')
        i = 0
        while i < len(linhas):
            if linhas[i].strip() in ('```exercicio', '```exercise'):
                j = i + 1
                while j < len(linhas) and linhas[j].strip() != '```':
                    j += 1
                out.append((f.relative_to(RAIZ).as_posix(), ler_exercicio(linhas[i + 1:j])))
                i = j
            i += 1
    return out
