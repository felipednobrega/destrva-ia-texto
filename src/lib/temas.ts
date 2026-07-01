// Banco de temas dissertativo-argumentativos no estilo ENEM.
// Selecionados a partir de temas reais/oficiais e simulados amplamente usados.

export type Tema = {
  id: string;
  titulo: string;
  eixo: string; // área temática
  descricao: string; // contextualização curta para orientar o candidato
};

export const TEMAS: Tema[] = [
  {
    id: "manipulacao-comportamento-redes",
    titulo: "Manipulação do comportamento do usuário pelo controle de dados pelas empresas de tecnologia",
    eixo: "Tecnologia e sociedade",
    descricao:
      "Discuta como a coleta massiva de dados por plataformas digitais influencia escolhas, opiniões e hábitos, e proponha caminhos para proteger o cidadão.",
  },
  {
    id: "democratizacao-cinema-brasil",
    titulo: "Desafios para a democratização do acesso ao cinema no Brasil",
    eixo: "Cultura e cidadania",
    descricao:
      "Reflita sobre as barreiras econômicas, geográficas e culturais que limitam o acesso da população brasileira ao cinema nacional.",
  },
  {
    id: "estigma-doencas-mentais",
    titulo: "O estigma associado às doenças mentais na sociedade brasileira",
    eixo: "Saúde e sociedade",
    descricao:
      "Analise como o preconceito dificulta diagnóstico e tratamento de transtornos mentais e proponha ações de conscientização.",
  },
  {
    id: "invisibilidade-cuidado-idoso",
    titulo: "Desafios para o cuidado e valorização da pessoa idosa no Brasil",
    eixo: "Direitos humanos",
    descricao:
      "Aborde o envelhecimento populacional, o abandono familiar/institucional e políticas públicas necessárias.",
  },
  {
    id: "trabalho-domestico-mulher",
    titulo: "Invisibilidade do trabalho doméstico feminino no Brasil",
    eixo: "Igualdade de gênero",
    descricao:
      "Discuta a divisão desigual de tarefas domésticas e seus impactos econômicos e sociais sobre a mulher.",
  },
  {
    id: "desinformacao-fake-news",
    titulo: "O combate à desinformação e às fake news na era digital",
    eixo: "Mídia e democracia",
    descricao:
      "Examine os efeitos das notícias falsas sobre a democracia, a saúde pública e a opinião pública, e proponha soluções.",
  },
  {
    id: "racismo-estrutural-brasil",
    titulo: "Caminhos para combater o racismo estrutural no Brasil",
    eixo: "Direitos humanos",
    descricao:
      "Reflita sobre as manifestações cotidianas e institucionais do racismo e medidas para superá-lo.",
  },
  {
    id: "lixo-eletronico",
    titulo: "Descarte consciente do lixo eletrônico no Brasil",
    eixo: "Meio ambiente",
    descricao:
      "Trate dos impactos ambientais do e-lixo e da responsabilidade compartilhada entre Estado, empresas e consumidores.",
  },
  {
    id: "evasao-escolar",
    titulo: "Causas e consequências da evasão escolar no ensino médio brasileiro",
    eixo: "Educação",
    descricao:
      "Analise fatores socioeconômicos e pedagógicos que levam à evasão e proponha intervenções.",
  },
  {
    id: "saude-mental-jovens",
    titulo: "Os impactos das redes sociais na saúde mental dos jovens brasileiros",
    eixo: "Saúde e tecnologia",
    descricao:
      "Relacione uso excessivo de redes sociais a ansiedade, depressão e distúrbios alimentares na juventude.",
  },
  {
    id: "trabalho-aplicativos",
    titulo: "Precarização do trabalho na era dos aplicativos no Brasil",
    eixo: "Trabalho e economia",
    descricao:
      "Discuta direitos trabalhistas, jornada e remuneração de motoristas e entregadores de plataformas.",
  },
  {
    id: "acesso-agua-potavel",
    titulo: "Desafios para garantir o acesso universal à água potável no Brasil",
    eixo: "Meio ambiente e cidadania",
    descricao:
      "Aborde desigualdades regionais, saneamento básico e gestão hídrica.",
  },
  {
    id: "violencia-mulher",
    titulo: "Caminhos para o enfrentamento da violência contra a mulher no Brasil",
    eixo: "Direitos humanos",
    descricao:
      "Examine a Lei Maria da Penha, feminicídio e o papel da educação e do Estado.",
  },
  {
    id: "leitura-jovens",
    titulo: "A importância do incentivo à leitura entre jovens brasileiros",
    eixo: "Educação e cultura",
    descricao:
      "Discuta o papel da escola, da família e das políticas públicas no estímulo à leitura.",
  },
  {
    id: "mobilidade-urbana",
    titulo: "Desafios da mobilidade urbana nas grandes cidades brasileiras",
    eixo: "Cidades",
    descricao:
      "Trate de transporte público, trânsito e meios alternativos de locomoção.",
  },
  {
    id: "ia-mercado-trabalho",
    titulo: "O impacto da inteligência artificial no mercado de trabalho brasileiro",
    eixo: "Tecnologia e trabalho",
    descricao:
      "Reflita sobre automação, requalificação profissional e desigualdade de acesso.",
  },
  {
    id: "patrimonio-historico",
    titulo: "Preservação do patrimônio histórico-cultural brasileiro",
    eixo: "Cultura",
    descricao:
      "Discuta abandono, vandalismo e financiamento da preservação cultural.",
  },
  {
    id: "intolerancia-religiosa",
    titulo: "Combate à intolerância religiosa no Brasil",
    eixo: "Direitos humanos",
    descricao:
      "Aborde manifestações de preconceito, especialmente contra religiões de matriz africana.",
  },
  {
    id: "alimentacao-saudavel",
    titulo: "Desafios para a promoção da alimentação saudável no Brasil",
    eixo: "Saúde pública",
    descricao:
      "Trate de ultraprocessados, fome, obesidade e o papel da escola e do Estado.",
  },
  {
    id: "inclusao-pcd",
    titulo: "Inclusão da pessoa com deficiência no mercado de trabalho brasileiro",
    eixo: "Direitos e trabalho",
    descricao: "Discuta barreiras de acessibilidade, capacitismo e Lei de Cotas.",
  },
  { id: "trabalho-infantil", titulo: "Caminhos para combater o trabalho infantil no Brasil", eixo: "Direitos humanos", descricao: "Analise causas socioeconômicas, fiscalização e papel da educação." },
  { id: "desmatamento-amazonia", titulo: "Desafios para conter o desmatamento da Amazônia", eixo: "Meio ambiente", descricao: "Aborde grilagem, fiscalização e desenvolvimento sustentável." },
  { id: "queimadas-pantanal", titulo: "Impactos das queimadas no Pantanal e no Cerrado brasileiros", eixo: "Meio ambiente", descricao: "Discuta causas humanas, perdas de biodiversidade e prevenção." },
  { id: "agrotoxicos-saude", titulo: "Uso de agrotóxicos e seus impactos na saúde pública brasileira", eixo: "Saúde e meio ambiente", descricao: "Aborde regulação, contaminação alimentar e alternativas agroecológicas." },
  { id: "consumismo-juvenil", titulo: "O consumismo na sociedade contemporânea brasileira", eixo: "Cultura e economia", descricao: "Reflita sobre publicidade, endividamento e impacto ambiental." },
  { id: "endividamento-familias", titulo: "Endividamento das famílias brasileiras na era do crédito digital", eixo: "Economia", descricao: "Discuta educação financeira, acesso ao crédito fácil e juros." },
  { id: "educacao-financeira-escola", titulo: "A importância da educação financeira nas escolas brasileiras", eixo: "Educação", descricao: "Analise lacunas no currículo e impactos na vida adulta." },
  { id: "professores-valorizacao", titulo: "A desvalorização do professor na educação brasileira", eixo: "Educação", descricao: "Trate de salários, formação e condições de trabalho docente." },
  { id: "ensino-domiciliar", titulo: "Os limites do ensino domiciliar (homeschooling) no Brasil", eixo: "Educação", descricao: "Discuta socialização, regulação e direito à educação." },
  { id: "tecnologia-sala-aula", titulo: "O uso de tecnologias digitais na sala de aula brasileira", eixo: "Educação e tecnologia", descricao: "Reflita sobre desigualdade de acesso e formação docente." },
  { id: "celular-escola", titulo: "O uso do celular em sala de aula no Brasil", eixo: "Educação e tecnologia", descricao: "Aborde distrações, aprendizagem e regulamentações." },
  { id: "bullying-escolar", titulo: "O combate ao bullying e ciberbullying nas escolas brasileiras", eixo: "Educação e direitos humanos", descricao: "Trate de consequências psicológicas e papel da comunidade escolar." },
  { id: "violencia-escolas", titulo: "A escalada da violência nas escolas brasileiras", eixo: "Segurança e educação", descricao: "Discuta ataques, prevenção e suporte psicossocial." },
  { id: "lgbtfobia", titulo: "O combate à LGBTfobia na sociedade brasileira", eixo: "Direitos humanos", descricao: "Analise violência, legislação e representatividade." },
  { id: "indigenas-direitos", titulo: "A demarcação de terras indígenas no Brasil", eixo: "Direitos humanos", descricao: "Aborde marco temporal, conflitos fundiários e cultura." },
  { id: "quilombolas", titulo: "Os desafios das comunidades quilombolas no Brasil contemporâneo", eixo: "Direitos humanos", descricao: "Trate de titulação de terras, acesso a serviços públicos e identidade." },
  { id: "refugiados-brasil", titulo: "A acolhida de refugiados e imigrantes no Brasil", eixo: "Direitos humanos", descricao: "Discuta xenofobia, políticas públicas e integração social." },
  { id: "populacao-rua", titulo: "Caminhos para enfrentar o problema da população em situação de rua no Brasil", eixo: "Direitos humanos", descricao: "Aborde moradia, saúde mental e assistência social." },
  { id: "habitacao-popular", titulo: "Déficit habitacional nas grandes cidades brasileiras", eixo: "Cidades", descricao: "Discuta favelização, especulação imobiliária e políticas habitacionais." },
  { id: "saneamento-basico", titulo: "Os desafios do saneamento básico no Brasil", eixo: "Saúde pública", descricao: "Trate de cobertura desigual, doenças e impacto ambiental." },
  { id: "sus-desafios", titulo: "Os desafios do SUS na saúde pública brasileira", eixo: "Saúde pública", descricao: "Analise filas, financiamento e atenção primária." },
  { id: "automedicacao", titulo: "Os riscos da automedicação na sociedade brasileira", eixo: "Saúde pública", descricao: "Discuta venda livre, cultura do remédio e papel do farmacêutico." },
  { id: "vacinacao-cobertura", titulo: "A queda da cobertura vacinal no Brasil", eixo: "Saúde pública", descricao: "Aborde desinformação, logística e confiança nas instituições." },
  { id: "obesidade-infantil", titulo: "A obesidade infantil no Brasil contemporâneo", eixo: "Saúde pública", descricao: "Trate de alimentação, sedentarismo e publicidade infantil." },
  { id: "sedentarismo-juventude", titulo: "Sedentarismo entre jovens brasileiros", eixo: "Saúde", descricao: "Discuta telas, esporte na escola e espaços públicos." },
  { id: "esporte-inclusao", titulo: "O papel do esporte como ferramenta de inclusão social no Brasil", eixo: "Cultura e cidadania", descricao: "Aborde projetos sociais, financiamento e protagonismo juvenil." },
  { id: "suicidio-juvenil", titulo: "Prevenção ao suicídio entre jovens brasileiros", eixo: "Saúde mental", descricao: "Trate de fatores de risco, escuta e campanhas como o Setembro Amarelo." },
  { id: "ansiedade-contemporanea", titulo: "A epidemia de ansiedade na sociedade brasileira contemporânea", eixo: "Saúde mental", descricao: "Reflita sobre ritmo de vida, redes sociais e acesso a tratamento." },
  { id: "burnout-trabalho", titulo: "A síndrome de burnout no mercado de trabalho brasileiro", eixo: "Saúde e trabalho", descricao: "Aborde sobrecarga, cultura do produtivismo e direitos." },
  { id: "trabalho-remoto", titulo: "Os impactos do trabalho remoto na sociedade brasileira", eixo: "Trabalho", descricao: "Discuta jornada, qualidade de vida e desigualdade de acesso." },
  { id: "desemprego-juvenil", titulo: "O desemprego entre jovens brasileiros", eixo: "Trabalho e economia", descricao: "Trate de qualificação, primeiro emprego e informalidade." },
  { id: "informalidade", titulo: "A informalidade no mercado de trabalho brasileiro", eixo: "Trabalho", descricao: "Aborde direitos, previdência e renda." },
  { id: "envelhecimento-populacional", titulo: "Os desafios do envelhecimento populacional para o Brasil", eixo: "Sociedade", descricao: "Discuta previdência, cuidado e mercado de trabalho." },
  { id: "natalidade-queda", titulo: "A queda da taxa de natalidade no Brasil e seus impactos", eixo: "Sociedade", descricao: "Reflita sobre causas econômicas, culturais e demográficas." },
  { id: "fome-inseguranca", titulo: "O retorno da fome e da insegurança alimentar no Brasil", eixo: "Direitos humanos", descricao: "Aborde desigualdade, políticas públicas e desperdício." },
  { id: "desperdicio-alimentos", titulo: "O desperdício de alimentos no Brasil", eixo: "Sustentabilidade", descricao: "Discuta cadeia produtiva, hábitos de consumo e doação." },
  { id: "consumo-sustentavel", titulo: "Caminhos para um consumo mais sustentável no Brasil", eixo: "Sustentabilidade", descricao: "Trate de economia circular, descarte e responsabilidade." },
  { id: "energia-renovavel", titulo: "A transição para energias renováveis no Brasil", eixo: "Meio ambiente", descricao: "Aborde matriz energética, custo e desenvolvimento regional." },
  { id: "mudancas-climaticas", titulo: "O Brasil diante das mudanças climáticas globais", eixo: "Meio ambiente", descricao: "Discuta eventos extremos, política externa e adaptação." },
  { id: "enchentes-urbanas", titulo: "As enchentes urbanas no Brasil e a falta de planejamento", eixo: "Cidades", descricao: "Trate de drenagem, ocupação de áreas de risco e prevenção." },
  { id: "transporte-publico", titulo: "Os desafios do transporte público nas cidades brasileiras", eixo: "Cidades", descricao: "Aborde qualidade, tarifa e direito à cidade." },
  { id: "ciclomobilidade", titulo: "O incentivo ao uso da bicicleta nas cidades brasileiras", eixo: "Cidades", descricao: "Discuta ciclovias, segurança e mobilidade ativa." },
  { id: "espacos-publicos", titulo: "A importância dos espaços públicos de convivência nas cidades brasileiras", eixo: "Cidades", descricao: "Reflita sobre praças, parques e segurança urbana." },
  { id: "turismo-sustentavel", titulo: "Os desafios do turismo sustentável no Brasil", eixo: "Economia e meio ambiente", descricao: "Aborde impacto ambiental, comunidades locais e infraestrutura." },
  { id: "cultura-popular", titulo: "A valorização da cultura popular brasileira", eixo: "Cultura", descricao: "Discuta financiamento, mídia e identidade nacional." },
  { id: "musica-streaming", titulo: "Os impactos do streaming na cultura musical brasileira", eixo: "Cultura e tecnologia", descricao: "Trate de remuneração de artistas, diversidade e descoberta." },
  { id: "literatura-nacional", titulo: "A presença da literatura brasileira na formação dos jovens", eixo: "Educação e cultura", descricao: "Aborde currículo escolar, leitura e identidade." },
  { id: "museus-acesso", titulo: "Os desafios para a democratização dos museus no Brasil", eixo: "Cultura", descricao: "Discuta acesso, financiamento e educação patrimonial." },
  { id: "esporte-feminino", titulo: "A valorização do esporte feminino no Brasil", eixo: "Esporte e gênero", descricao: "Trate de patrocínio, mídia e infraestrutura." },
  { id: "doping-esporte", titulo: "O combate ao doping no esporte brasileiro", eixo: "Esporte", descricao: "Aborde ética, saúde dos atletas e fiscalização." },
  { id: "jogos-azar-online", titulo: "Os riscos das apostas esportivas online no Brasil", eixo: "Saúde e economia", descricao: "Discuta vício, regulação e proteção ao consumidor." },
  { id: "cyberbullying-redes", titulo: "Os crimes virtuais e a impunidade nas redes sociais brasileiras", eixo: "Tecnologia e direito", descricao: "Trate de difamação, ódio online e legislação." },
  { id: "discurso-odio", titulo: "O discurso de ódio nas redes sociais brasileiras", eixo: "Mídia e democracia", descricao: "Aborde liberdade de expressão, regulação e responsabilidade das plataformas." },
  { id: "polarizacao-politica", titulo: "A polarização política e seus impactos na democracia brasileira", eixo: "Política", descricao: "Discuta diálogo público, mídia e instituições." },
  { id: "voto-jovem", titulo: "A participação política dos jovens no Brasil", eixo: "Cidadania", descricao: "Trate de voto facultativo aos 16, educação política e engajamento." },
  { id: "corrupcao-politica", titulo: "O combate à corrupção política no Brasil", eixo: "Política e ética", descricao: "Aborde transparência, controle social e impunidade." },
  { id: "transparencia-publica", titulo: "A transparência na gestão pública brasileira", eixo: "Política", descricao: "Discuta Lei de Acesso à Informação, dados abertos e fiscalização cidadã." },
  { id: "seguranca-publica", titulo: "Os desafios da segurança pública no Brasil", eixo: "Segurança", descricao: "Aborde violência urbana, polícia comunitária e prevenção." },
  { id: "sistema-prisional", titulo: "A crise do sistema prisional brasileiro", eixo: "Segurança e direitos humanos", descricao: "Discuta superlotação, ressocialização e facções." },
  { id: "menor-infrator", titulo: "A redução da maioridade penal no Brasil em debate", eixo: "Direitos humanos", descricao: "Aborde ECA, ressocialização e medidas socioeducativas." },
  { id: "drogas-politica", titulo: "Caminhos para uma nova política de drogas no Brasil", eixo: "Saúde e segurança", descricao: "Discuta descriminalização, tratamento e redução de danos." },
  { id: "transito-brasileiro", titulo: "A violência no trânsito brasileiro", eixo: "Segurança", descricao: "Trate de imprudência, fiscalização e educação no trânsito." },
];

const TEMAS_BY_ID = new Map(TEMAS.map((t) => [t.id, t]));

// Tema do dia determinístico — todo mundo vê o mesmo tema no mesmo dia (UTC).
export function getTemaDoDia(date = new Date()): Tema {
  return pickDeterministico(TEMAS, dayKey(date));
}

// Tema do dia evitando temas já feitos (passe os títulos das redações do usuário).
export function getTemaDoDiaParaUsuario(temasJaFeitos: Iterable<string>, date = new Date()): Tema {
  const feitos = new Set(Array.from(temasJaFeitos).map((t) => t.trim().toLowerCase()));
  const disponiveis = TEMAS.filter((t) => !feitos.has(t.titulo.trim().toLowerCase()));
  if (disponiveis.length === 0) return getTemaDoDia(date); // já fez todos: repete tema do dia
  // Chave estável por usuário+dia para que reload não troque o tema.
  return pickDeterministico(disponiveis, dayKey(date));
}

// Sorteia um tema aleatório que ainda não foi feito (Pro reroll).
export function sortearTemaInedito(temasJaFeitos: Iterable<string>, evitar?: string): Tema | null {
  const feitos = new Set(Array.from(temasJaFeitos).map((t) => t.trim().toLowerCase()));
  if (evitar) feitos.add(evitar.trim().toLowerCase());
  const disponiveis = TEMAS.filter((t) => !feitos.has(t.titulo.trim().toLowerCase()));
  if (disponiveis.length === 0) return null;
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

export function getTemaById(id: string): Tema | undefined {
  return TEMAS_BY_ID.get(id);
}

function dayKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

function pickDeterministico(lista: Tema[], key: string): Tema {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return lista[Math.abs(hash) % lista.length];
}
