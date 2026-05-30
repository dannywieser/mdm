export const noteContentStyles = {
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontWeight: 'semibold',
    lineHeight: 'shorter',
    color: 'green.300',
    mt: '6',
    mb: '3'
  },
  '& h1': { fontSize: '2xl' },
  '& h2': { fontSize: 'xl' },
  '& h3': { fontSize: 'lg' },
  '& p': { mb: '4', lineHeight: 'tall' },
  '& ul': { pl: '6', mb: '4', listStyleType: 'disc' },
  '& ol': { pl: '6', mb: '4', listStyleType: 'decimal' },
  '& li': { mb: '1' },
  '& ul.contains-task-list': {
    listStyleType: 'none',
    pl: '0'
  },
  '& li.task-list-item': {
    listStyleType: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2'
  },
  '& li.task-list-item .task-list-icon': {
    flexShrink: 0,
    mt: '0.5'
  },
  '& li.task-list-item .task-list-icon--checked': {
    color: 'green.500'
  },
  '& li.task-list-item .task-list-icon--unchecked': {
    color: 'green.900'
  },
  '& a': { color: 'green.400', textDecoration: 'underline', _hover: { color: 'green.300' } },
  '& blockquote': {
    borderInlineStartWidth: '4px',
    borderColor: 'green.900',
    color: 'green.600',
    pl: '4',
    py: '1',
    my: '4'
  },
  '& pre': {
    bg: 'black',
    borderWidth: '1px',
    borderColor: 'green.900',
    borderRadius: 'md',
    overflowX: 'auto',
    p: '4',
    my: '4'
  },
  '& code': {
    bg: 'black',
    color: 'green.300',
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
    borderColor: 'green.900',
    px: '3',
    py: '2',
    textAlign: 'left'
  },
  '& th': {
    color: 'green.300'
  },
  '& hr': {
    borderColor: 'green.900',
    my: '6'
  },
  '& img': {
    borderRadius: 'md',
    my: '4'
  },
  '& .wikilink-unmatched': {
    color: 'green.700',
    textDecoration: 'underline',
    textDecorationStyle: 'dashed',
    textUnderlineOffset: '3px'
  }
}
