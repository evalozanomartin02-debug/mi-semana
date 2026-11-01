// Solo se aceptan noticias de estos medios (dominio → nombre visible).
export const MEDIOS = {
  'elpais.com': 'El País', 'cincodias.elpais.com': 'Cinco Días', 'abc.es': 'ABC', 'elmundo.es': 'El Mundo', 'lavanguardia.com': 'La Vanguardia',
  'rtve.es': 'RTVE', 'efe.com': 'EFE', 'europapress.es': 'Europa Press', 'elconfidencial.com': 'El Confidencial', 'eldiario.es': 'elDiario.es',
  'marca.com': 'Marca', 'as.com': 'AS', 'mundodeportivo.com': 'Mundo Deportivo',
  'bbc.com': 'BBC', 'bbc.co.uk': 'BBC', 'theguardian.com': 'The Guardian', 'reuters.com': 'Reuters', 'apnews.com': 'AP', 'nytimes.com': 'The New York Times',
  'variety.com': 'Variety', 'hollywoodreporter.com': 'The Hollywood Reporter', 'deadline.com': 'Deadline', 'billboard.com': 'Billboard', 'rollingstone.com': 'Rolling Stone',
  'lemonde.fr': 'Le Monde', 'lefigaro.fr': 'Le Figaro', 'france24.com': 'France 24', 'rfi.fr': 'RFI', 'uefa.com': 'UEFA', 'atptour.com': 'ATP', 'formula1.com': 'Fórmula 1', 'motogp.com': 'MotoGP',
  'independent.co.uk': 'The Independent', 'cnn.com': 'CNN', 'espn.com': 'ESPN', 'skysports.com': 'Sky Sports', 'nme.com': 'NME', 'pitchfork.com': 'Pitchfork', 'euronews.com': 'Euronews',
  'elespanol.com': 'El Español', '20minutos.es': '20minutos', 'sport.es': 'Sport', 'elperiodico.com': 'El Periódico', 'cadenaser.com': 'Cadena SER', 'cope.es': 'COPE',
  'lesoir.be': 'Le Soir', 'rtbf.be': 'RTBF', 'lalibre.be': 'La Libre', 'dhnet.be': 'DH', 'levif.be': 'Le Vif', 'lecho.be': "L'Echo", 'vrt.be': 'VRT', 'sporza.be': 'Sporza',
  'brusselstimes.com': 'The Brussels Times', 'standaard.be': 'De Standaard', 'hln.be': 'HLN', 'nieuwsblad.be': 'Het Nieuwsblad', 'demorgen.be': 'De Morgen', 'bruzz.be': 'BRUZZ',
  'prnoticias.com': 'PRNoticias', 'reasonwhy.es': 'Reason Why', 'elpublicista.es': 'El Publicista', 'topcomunicacion.com': 'Top Comunicación', 'dircom.org': 'Dircom',
  'corporateexcellence.org': 'Corporate Excellence', 'expansion.com': 'Expansión', 'hbr.org': 'Harvard Business Review', 'harvard-deusto.com': 'Harvard Deusto', 'provokemedia.com': 'PRovoke Media',
  'prweek.com': 'PRWeek', 'eacd-online.eu': 'EACD', 'communicationdirector.com': 'Communication Director', 'mckinsey.com': 'McKinsey', 'forbes.es': 'Forbes España',
};

export const POR_SECCION = 8;
export const MAX_POR_TEMA = 3;
export const MAX_POR_MEDIO = 3;
export const HORAS = { mundo: 72, espana: 72, belgica: 72, comunicacion: 168 };

export const EXCLUIR = /mostrar informaci[oó]n|d[oó]nde ver|a qu[eé] hora|horarios?\b|en directo|en vivo|\b(DIRECT|LIVE)\b|streaming|how to watch|hor[oó]scopo|loter[ií]a|ofertas?\b|rugby|cricket|p[aá]del|elecci[oó]n|elecciones|electoral|election|[eé]lection|Trump|S[aá]nchez|Feij[oó]o|PSOE|\bPP\b|\bVox\b|ministr|parlament|gobierno|government|gouvernement|regering|guerra|\bwar\b|guerre|oorlog|Gaza|Ucrania|Ukraine|Isra[eë]l|asesin|crimen|homicid|detenid|violaci[oó]n|accidente|tragedia|murder|killed|meurtre|moord|polic[ií]a|police|politie|inflaci[oó]n|inflation|\bPIB\b|\bGDP\b/i;

const q = (seccion, tema, mercado, ...consultas) => consultas.map((consulta) => ({ seccion, tema, mercado, consulta }));

// Cada búsqueda va a Bing Noticias, que no necesita clave.
export const BUSQUEDAS = [
  ...q('mundo', 'Premios', 'en-GB', 'Oscars winners', 'Grammy Awards', 'Latin Grammy', 'Nobel Prize', 'Ballon d\'Or', 'Eurovision', 'Booker Prize', 'Pulitzer Prize'),
  ...q('mundo', 'Cine y series', 'en-GB', 'Cannes film festival', 'Venice film festival', 'Berlinale', 'box office biggest film', 'most watched series'),
  ...q('mundo', 'Música', 'en-GB', 'world tour announced', 'album release most anticipated', 'Super Bowl halftime show'),
  ...q('mundo', 'Arte y libros', 'en-GB', 'major exhibition opens museum', 'bestselling novel adaptation'),
  ...q('mundo', 'Deporte', 'en-GB', 'Champions League result', 'Formula 1 grand prix result', 'MotoGP result', 'Tour de France', 'NBA', 'Olympics', 'World Cup'),
  ...q('mundo', 'Personalidades', 'en-GB', 'actor dies aged', 'singer dies aged', 'author dies aged'),
  ...q('mundo', 'Premios', 'es-ES', 'premios Oscar', 'premios Grammy', 'Latin Grammy ganadores', 'Premio Nobel', 'Balón de Oro', 'Eurovisión'),
  ...q('mundo', 'Cine y series', 'es-ES', 'festival de Cannes', 'festival de Venecia', 'serie más vista Netflix'),
  ...q('mundo', 'Música', 'es-ES', 'gira mundial anuncia', 'nuevo álbum lanzamiento'),
  ...q('mundo', 'Deporte', 'es-ES', 'Champions League resultado', 'Fórmula 1 gran premio', 'Tour de Francia', 'NBA'),
  ...q('mundo', 'Personalidades', 'es-ES', 'muere actor', 'muere cantante'),
  ...q('espana', 'Premios', 'es-ES', 'Premios Goya', 'Premio Princesa de Asturias', 'Premio Planeta', 'Premio Cervantes', 'Premio Nadal', 'Festival de San Sebastián', 'Latin Grammy españoles'),
  ...q('espana', 'Música', 'es-ES', 'gira España conciertos anuncia', 'Rosalía', 'Benidorm Fest', 'festival música cartel España'),
  ...q('espana', 'Cine y series', 'es-ES', 'estreno cine español', 'serie española estreno'),
  ...q('espana', 'Arte y libros', 'es-ES', 'exposición Museo del Prado', 'exposición Madrid Reina Sofía Thyssen', 'novela más vendida España'),
  ...q('espana', 'Deporte', 'es-ES', 'LaLiga resultado jornada', 'selección española fútbol', 'Alcaraz', 'ciclismo español', 'Liga Endesa baloncesto', 'Marc Márquez MotoGP', 'Fernando Alonso Sainz F1'),
  ...q('espana', 'Personalidades', 'es-ES', 'muere actor español', 'muere cantante español', 'muere escritor español', 'polémica famosa España'),
  ...q('belgica', 'Música', 'fr-BE', 'Rock Werchter', 'Tomorrowland', 'Graspop', 'concert Bruxelles Forest National'),
  ...q('belgica', 'Premios', 'fr-BE', 'prix Goncourt', 'prix Renaudot', 'prix Femina', 'prix Médicis', 'Magritte du cinéma'),
  ...q('belgica', 'Cine y series', 'fr-BE', 'film belge sortie', 'série belge RTBF'),
  ...q('belgica', 'Arte y libros', 'fr-BE', 'exposition Bruxelles Bozar', 'sortir à Bruxelles ce week-end'),
  ...q('belgica', 'Deporte', 'fr-BE', 'Pro League résultat', 'Club Bruges', 'Anderlecht', 'Union Saint-Gilloise', 'Diables Rouges'),
  ...q('belgica', 'Deporte', 'nl-BE', 'Jupiler Pro League uitslag', 'Rode Duivels', 'Remco Evenepoel', 'Wout van Aert'),
  ...q('belgica', 'País', 'nl-BE', 'Vlaanderen cultuur nieuws', 'Brussel tentoonstelling'),
  ...q('belgica', 'País', 'fr-BE', 'grève nationale Belgique', 'Bruxelles nouveauté transports', 'Wallonie événement'),
  ...q('comunicacion', 'Comunicación', 'es-ES', 'reputación corporativa', 'comunicación de crisis empresa', 'comunicación interna', 'asuntos públicos lobby', 'marca corporativa', 'dircom', 'inteligencia artificial comunicación corporativa', 'intangibles medición comunicación', 'criterios ASG empresa'),
  ...q('comunicacion', 'Comunicación', 'en-GB', 'corporate reputation', 'crisis communications', 'internal communications', 'corporate communications AI'),
  ...q('comunicacion', 'Empresa', 'es-ES', 'estrategia empresarial liderazgo', 'management directivos'),
  ...q('comunicacion', 'Empresa', 'en-GB', 'leadership strategy Harvard Business Review'),
];

// Feeds directos de los medios especializados que Bing cubre peor.
export const FEEDS = [
  { seccion: 'comunicacion', tema: 'Comunicación', url: 'https://www.dircom.org/feed/', excluir: /^ACTUALIDAD/ },
  { seccion: 'comunicacion', tema: 'Comunicación', url: 'https://topcomunicacion.com/feed/' },
  { seccion: 'comunicacion', tema: 'Comunicación', url: 'https://eacd-online.eu/feed/' },
];
