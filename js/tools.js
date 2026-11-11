/* Onde descarregar ou abrir cada programa referido nas cadeiras (página oficial).
   Nomes compostos ("Git / GitHub", "C (gcc/clang)") são partidos e cada parte ganha a sua ligação. */
window.TOOL_URLS = {
  'git': 'https://git-scm.com/downloads', 'github': 'https://github.com/', 'gitlab': 'https://about.gitlab.com/', 'github projects': 'https://docs.github.com/issues/planning-and-tracking-with-projects',
  'github actions': 'https://docs.github.com/actions', 'gitlab ci': 'https://docs.gitlab.com/ee/ci/', 'git diff': 'https://git-scm.com/docs/git-diff',
  'bash': 'https://www.gnu.org/software/bash/', 'zsh': 'https://www.zsh.org/', 'vs code': 'https://code.visualstudio.com/download', 'vim': 'https://www.vim.org/download.php',
  'ssh': 'https://www.openssh.com/', 'markdown': 'https://commonmark.org/help/', 'latex': 'https://www.latex-project.org/get/', 'overleaf': 'https://www.overleaf.com/',
  'python 3': 'https://www.python.org/downloads/', 'python': 'https://www.python.org/downloads/', 'thonny': 'https://thonny.org/', 'jupyter': 'https://jupyter.org/install',
  'pytest': 'https://docs.pytest.org/', 'swi-prolog': 'https://www.swi-prolog.org/download/stable', 'prolog': 'https://www.swi-prolog.org/download/stable',
  'lean 4': 'https://lean-lang.org/', 'minisat': 'http://minisat.se/', 'z3': 'https://github.com/Z3Prover/z3/releases', 'desmos': 'https://www.desmos.com/calculator',
  'geogebra': 'https://www.geogebra.org/download', 'wolfram alpha': 'https://www.wolframalpha.com/', 'sympy': 'https://www.sympy.org/', 'numpy': 'https://numpy.org/install/',
  'matplotlib': 'https://matplotlib.org/stable/install/', 'scipy': 'https://scipy.org/install/', 'pandas': 'https://pandas.pydata.org/docs/getting_started/install.html',
  'gnu octave': 'https://octave.org/download', 'matlab': 'https://www.mathworks.com/products/matlab.html', 'julia': 'https://julialang.org/downloads/', 'choosealicense.com': 'https://choosealicense.com/',
  'c': 'https://gcc.gnu.org/install/binaries.html', 'gcc': 'https://gcc.gnu.org/install/binaries.html', 'clang': 'https://releases.llvm.org/download.html', 'c++': 'https://isocpp.org/get-started',
  'make': 'https://www.gnu.org/software/make/', 'gdb': 'https://www.sourceware.org/gdb/download/', 'valgrind': 'https://valgrind.org/downloads/', 'addresssanitizer': 'https://clang.llvm.org/docs/AddressSanitizer.html',
  'clion': 'https://www.jetbrains.com/clion/download/', 'graphviz': 'https://graphviz.org/download/', 'logisim-evolution': 'https://github.com/logisim-evolution/logisim-evolution/releases',
  'digital': 'https://github.com/hneemann/Digital/releases', 'verilog': 'https://steveicarus.github.io/iverilog/', 'vhdl': 'https://ghdl.github.io/ghdl/', 'icarus verilog': 'https://steveicarus.github.io/iverilog/',
  'gtkwave': 'https://gtkwave.sourceforge.net/', 'nand2tetris tools': 'https://www.nand2tetris.org/software', 'haskell': 'https://www.haskell.org/ghcup/', 'ghc': 'https://www.haskell.org/ghcup/',
  'ghci': 'https://www.haskell.org/ghcup/', 'cabal': 'https://www.haskell.org/cabal/', 'stack': 'https://docs.haskellstack.org/', 'ocaml': 'https://ocaml.org/install', 'standard ml': 'https://www.smlnj.org/',
  'racket': 'https://download.racket-lang.org/', 'scheme': 'https://download.racket-lang.org/', 'phet': 'https://phet.colorado.edu/', 'falstad circuit simulator': 'https://www.falstad.com/circuit/',
  'java': 'https://adoptium.net/', 'java (jdk)': 'https://adoptium.net/', 'jdk': 'https://adoptium.net/', 'visualgo': 'https://visualgo.net/', 'cses': 'https://cses.fi/problemset/',
  'intellij idea': 'https://www.jetbrains.com/idea/download/', 'maven': 'https://maven.apache.org/download.cgi', 'gradle': 'https://gradle.org/install/', 'junit': 'https://junit.org/',
  'plantuml': 'https://plantuml.com/download', 'typescript': 'https://www.typescriptlang.org/download/', 'rars': 'https://github.com/TheThirdOne/rars/releases', 'venus': 'https://venus.cs61c.org/',
  'mars': 'https://dpetersanderson.github.io/', 'x86-64': 'https://www.sourceware.org/gdb/download/', 'compiler explorer': 'https://godbolt.org/', 'r': 'https://cran.r-project.org/',
  'rstudio': 'https://posit.co/download/rstudio-desktop/', 'excel': 'https://www.microsoft.com/microsoft-365/excel', 'libreoffice calc': 'https://www.libreoffice.org/download/download-libreoffice/',
  'linux': 'https://ubuntu.com/download/desktop', 'posix threads': 'https://man7.org/linux/man-pages/man7/pthreads.7.html', 'pthreads': 'https://man7.org/linux/man-pages/man7/pthreads.7.html',
  'strace': 'https://strace.io/', 'qemu': 'https://www.qemu.org/download/', 'xv6': 'https://github.com/mit-pdos/xv6-riscv', 'codeforces': 'https://codeforces.com/',
  'postgresql': 'https://www.postgresql.org/download/', 'mysql': 'https://dev.mysql.com/downloads/', 'mariadb': 'https://mariadb.org/download/', 'sqlite': 'https://sqlite.org/download.html',
  'dbeaver': 'https://dbeaver.io/download/', 'pgadmin': 'https://www.pgadmin.org/download/', 'draw.io': 'https://www.drawio.com/', 'erdplus': 'https://erdplus.com/', 'mongodb': 'https://www.mongodb.com/try/download/community',
  'oracle': 'https://www.oracle.com/database/free/', 'jflap': 'https://www.jflap.org/', 'automaton simulator': 'https://automatonsimulator.com/', 'figma': 'https://www.figma.com/downloads/',
  'balsamiq': 'https://balsamiq.com/', 'html': 'https://developer.mozilla.org/docs/Web/HTML', 'css': 'https://developer.mozilla.org/docs/Web/CSS', 'javascript': 'https://developer.mozilla.org/docs/Web/JavaScript',
  'axe devtools': 'https://www.deque.com/axe/devtools/', 'lighthouse': 'https://developer.chrome.com/docs/lighthouse/', 'wireshark': 'https://www.wireshark.org/download.html',
  'cisco packet tracer': 'https://www.netacad.com/resources/lab-downloads', 'gns3': 'https://www.gns3.com/software/download', 'tcpdump': 'https://www.tcpdump.org/', 'netcat': 'https://nmap.org/ncat/',
  'mininet': 'https://mininet.org/download/', 'jira': 'https://www.atlassian.com/software/jira', 'trello': 'https://trello.com/', 'docker': 'https://www.docker.com/products/docker-desktop/',
  'sonarqube': 'https://www.sonarsource.com/products/sonarqube/downloads/', 'node.js': 'https://nodejs.org/en/download', 'react': 'https://react.dev/learn/installation', 'php': 'https://www.php.net/downloads',
  'laravel': 'https://laravel.com/docs/installation', 'devtools do browser': 'https://developer.chrome.com/docs/devtools/', 'networkx': 'https://networkx.org/', 'flex': 'https://github.com/westes/flex/releases',
  'bison': 'https://www.gnu.org/software/bison/', 'antlr': 'https://www.antlr.org/download.html', 'llvm': 'https://releases.llvm.org/download.html', 'pulp': 'https://coin-or.github.io/pulp/',
  'glpk': 'https://www.gnu.org/software/glpk/', 'excel solver': 'https://support.microsoft.com/office/define-and-solve-a-problem-by-using-solver-5d1a388f-079d-43ac-a7eb-f63e45925040',
  'scikit-learn': 'https://scikit-learn.org/stable/install.html', 'pytorch': 'https://pytorch.org/get-started/locally/', 'tensorflow': 'https://www.tensorflow.org/install', 'keras': 'https://keras.io/getting_started/',
  'google colab': 'https://colab.research.google.com/', 'opengl': 'https://www.opengl.org/', 'webgl': 'https://developer.mozilla.org/docs/Web/API/WebGL_API', 'three.js': 'https://threejs.org/',
  'glsl': 'https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)', 'blender': 'https://www.blender.org/download/', 'go': 'https://go.dev/dl/', 'rmi': 'https://docs.oracle.com/javase/tutorial/rmi/',
  'grpc': 'https://grpc.io/docs/', 'kafka': 'https://kafka.apache.org/downloads', 'zookeeper': 'https://zookeeper.apache.org/releases.html', 'etcd': 'https://etcd.io/docs/latest/install/',
  'openssl': 'https://openssl-library.org/source/', 'nmap': 'https://nmap.org/download.html', 'burp suite': 'https://portswigger.net/burp/communitydownload', 'ghidra': 'https://github.com/NationalSecurityAgency/ghidra/releases',
  'kali linux': 'https://www.kali.org/get-kali/', 'owasp zap': 'https://www.zaproxy.org/download/', 'ci/cd': 'https://docs.github.com/actions', 'rocq': 'https://rocq-prover.org/install', 'coq': 'https://rocq-prover.org/install',
  'openmp': 'https://www.openmp.org/', 'mpi': 'https://www.open-mpi.org/software/', 'cuda': 'https://developer.nvidia.com/cuda-downloads', 'perf': 'https://perfwiki.github.io/main/',
  'tla+': 'https://lamport.azurewebsites.net/tla/toolbox.html', 'tlc': 'https://lamport.azurewebsites.net/tla/toolbox.html', 'alloy': 'https://alloytools.org/download.html', 'dafny': 'https://dafny.org/latest/Installation',
  'isabelle': 'https://isabelle.in.tum.de/', 'spin': 'https://spinroot.com/', 'uppaal': 'https://uppaal.org/downloads/', 'kubernetes': 'https://kubernetes.io/docs/tasks/tools/', 'terraform': 'https://developer.hashicorp.com/terraform/install',
  'ansible': 'https://docs.ansible.com/ansible/latest/installation_guide/', 'aws': 'https://aws.amazon.com/free/', 'azure': 'https://azure.microsoft.com/free/', 'gcp': 'https://cloud.google.com/free',
  'prometheus': 'https://prometheus.io/download/', 'grafana': 'https://grafana.com/grafana/download', 'linear': 'https://linear.app/download', 'slack': 'https://slack.com/downloads',
  'jest': 'https://jestjs.io/', 'vitest': 'https://vitest.dev/', 'ruff': 'https://docs.astral.sh/ruff/installation/', 'eslint': 'https://eslint.org/docs/latest/use/getting-started', 'mypy': 'https://mypy.readthedocs.io/',
  'coverage.py': 'https://coverage.readthedocs.io/', 'fastapi': 'https://fastapi.tiangolo.com/', 'alembic': 'https://alembic.sqlalchemy.org/', 'neon': 'https://neon.tech/', 'supabase': 'https://supabase.com/',
  'google cloud run': 'https://cloud.google.com/run', 'render': 'https://render.com/', 'sentry': 'https://sentry.io/', 'excalidraw': 'https://excalidraw.com/', 'redis': 'https://redis.io/downloads/',
  'rabbitmq': 'https://www.rabbitmq.com/docs/download', 'sqs': 'https://aws.amazon.com/sqs/', 'opentelemetry': 'https://opentelemetry.io/docs/', 'uptimerobot': 'https://uptimerobot.com/',
  'py-spy': 'https://github.com/benfred/py-spy', 'chrome performance': 'https://developer.chrome.com/docs/devtools/performance', 'google docs': 'https://docs.google.com/', 'notion': 'https://www.notion.com/desktop',
  'github copilot': 'https://github.com/features/copilot', 'claude': 'https://claude.ai/download', 'chatgpt': 'https://chatgpt.com/',
  'digital (h. neemann)': 'https://github.com/hneemann/Digital/releases', 'x86-64 + gdb': 'https://www.sourceware.org/gdb/download/', 'rars / venus (risc-v)': 'https://github.com/TheThirdOne/rars/releases', 'mars (mips)': 'https://dpetersanderson.github.io/', 'sockets (c/python/java)': 'https://beej.us/guide/bgnet/'
};
(() => {
  const U = window.TOOL_URLS, esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const key = s => s.trim().toLowerCase().replace(/\s*\((em|in) [^)]*\)$/, '').replace(/\s+/g, ' ');
  const link = (txt, href) => `<a class="tool" href="${href}" target="_blank" rel="noopener" title="${esc(href.replace(/^https?:\/\//, '').split('/')[0])}">${esc(txt)}<span class="tool-ext" aria-hidden="true">↗</span></a>`;
  // um nome da lista: ligado inteiro se for conhecido; senão partido por «/» e pelo que está entre parênteses
  window.toolHTML = name => {
    const k = key(name); if (U[k]) return link(name, U[k]);
    const m = /^(.*?)\s*\((.*)\)\s*$/.exec(name);
    const parts = m ? [m[1], ...m[2].split(/[,/]/)] : name.split(/\s+\/\s+|\//);
    const linked = parts.map(p => p.trim()).filter(Boolean).map(p => U[key(p)] ? link(p, U[key(p)]) : `<span class="tool">${esc(p)}</span>`);
    return linked.length > 1 ? `<span class="tool-grp">${linked.join('')}</span>` : linked[0] || `<span class="tool">${esc(name)}</span>`;
  };
})();
