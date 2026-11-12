/* Corre o código dos exercícios num processo à parte (Web Worker), com o Python do Pyodide.
   Se o código ficar preso num ciclo infinito, a página termina este processo e cria outro:
   a página nunca bloqueia. Recebe {id, code, tests, forbid} e devolve {id, res}. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

const HARNESS = `
import ast, json, sys, io, traceback

FICH = '<o teu código>'
NOS = {'for': ast.For, 'while': ast.While, 'import': (ast.Import, ast.ImportFrom)}

def _fmt(v):
    r = repr(v)
    return r if len(r) <= 200 else r[:197] + '...'

def _exc(e):
    linha = None
    for fr in traceback.extract_tb(e.__traceback__):
        if fr.filename == FICH:
            linha = fr.lineno
    return {'tipo': type(e).__name__, 'msg': str(e), 'linha': linha}

def corrigir(code, tests_json, forbid_json):
    tests, forbid = json.loads(tests_json), json.loads(forbid_json)
    out = {'ok': False, 'erro': None, 'testes': [], 'stdout': ''}
    try:
        tree = ast.parse(code, FICH)
    except SyntaxError as e:
        out['erro'] = {'tipo': type(e).__name__, 'msg': e.msg, 'linha': e.lineno}
        return json.dumps(out)
    # o que o exercício não deixa usar (funções prontas como max, ou ciclos num exercício de recursão)
    usados = set()
    for n in ast.walk(tree):
        if isinstance(n, ast.Name): usados.add(n.id)
        elif isinstance(n, ast.Attribute): usados.add(n.attr)
        for k, tipo in NOS.items():
            if isinstance(n, tipo): usados.add(k)
    proibidos = [f for f in forbid if f in usados]
    if proibidos:
        out['erro'] = {'tipo': 'Proibido', 'nomes': proibidos}
        return json.dumps(out)
    buf, antigo = io.StringIO(), sys.stdout
    sys.stdout = buf
    ns = {'__name__': '__main__'}
    try:
        exec(compile(tree, FICH, 'exec'), ns)
        for t in tests:
            r = {'expr': t}
            try:
                node = ast.parse(t, mode='eval').body
                if isinstance(node, ast.Compare) and len(node.ops) == 1 and isinstance(node.ops[0], ast.Eq):
                    obtido = eval(compile(ast.Expression(node.left), '<teste>', 'eval'), ns)
                    esperado = eval(compile(ast.Expression(node.comparators[0]), '<teste>', 'eval'), ns)
                    ok = obtido == esperado
                    if not ok and isinstance(esperado, float) and isinstance(obtido, (int, float)):
                        ok = abs(obtido - esperado) < 1e-9
                    r.update(chamada=ast.unparse(node.left), esperado=_fmt(esperado), obtido=_fmt(obtido), ok=bool(ok))
                else:
                    r.update(chamada=t, ok=bool(eval(compile(ast.Expression(node), '<teste>', 'eval'), ns)))
            except Exception as e:
                r.update(ok=False, erro=_exc(e))
            out['testes'].append(r)
    except Exception as e:
        out['erro'] = _exc(e)
    finally:
        sys.stdout = antigo
    out['stdout'] = buf.getvalue()[-2000:]
    out['ok'] = out['erro'] is None and bool(out['testes']) and all(r['ok'] for r in out['testes'])
    return json.dumps(out)
`;

let py = null;
const ready = loadPyodide().then(p => { py = p; py.runPython(HARNESS); postMessage({ ready: true }); })
  .catch(e => postMessage({ ready: false, fail: String(e) }));

onmessage = async e => {
  const { id, code, tests, forbid } = e.data;
  try {
    await ready; if (!py) throw new Error('Python não carregou');
    py.runPython('import sys; sys.setrecursionlimit(3000)');
    const res = py.globals.get('corrigir')(code, JSON.stringify(tests || []), JSON.stringify(forbid || []));
    postMessage({ id, res: JSON.parse(res) });
  } catch (err) {
    postMessage({ id, res: { ok: false, erro: { tipo: 'Interno', msg: String(err && err.message || err) }, testes: [] } });
  }
};
