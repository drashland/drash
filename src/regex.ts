const PATTERNS = {
  uri_matches: new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, 'g'),
  uri_replacement: '([^/]+)',
};

export default PATTERNS
