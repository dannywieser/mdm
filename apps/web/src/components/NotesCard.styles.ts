export const noteContentStyles = {
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontWeight: 'semibold',
    lineHeight: 'shorter',
    mt: '6',
    mb: '3'
  },
  '& h1': { fontSize: '2xl' },
  '& h2': { fontSize: 'xl' },
  '& h3': { fontSize: 'lg' },
  '& p': { mb: '4', lineHeight: 'tall' },
  '& ul, & ol': { pl: '6', mb: '4' },
  '& li': { mb: '1' },
  '& a': { color: 'colorPalette.fg', textDecoration: 'underline' },
  '& blockquote': {
    borderInlineStartWidth: '4px',
    borderColor: 'border.emphasized',
    color: 'fg.muted',
    pl: '4',
    py: '1',
    my: '4'
  },
  '& pre': {
    bg: 'bg.muted',
    borderRadius: 'md',
    overflowX: 'auto',
    p: '4',
    my: '4'
  },
  '& code': {
    bg: 'bg.muted',
    borderRadius: 'sm',
    px: '1.5',
    py: '0.5'
  },
  '& pre code': {
    bg: 'transparent',
    p: '0'
  },
  '& table': {
    width: 'full',
    borderCollapse: 'collapse',
    my: '4'
  },
  '& th, & td': {
    borderWidth: '1px',
    borderColor: 'border.subtle',
    px: '3',
    py: '2',
    textAlign: 'left'
  },
  '& hr': {
    borderColor: 'border.subtle',
    my: '6'
  },
  '& img': {
    borderRadius: 'md',
    my: '4'
  },
  '& .wikilink-unmatched': {
    textDecoration: 'underline',
    textDecorationStyle: 'dashed',
    textUnderlineOffset: '3px'
  }
}
