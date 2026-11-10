
export const GET_MENU_QUERY = `#graphql
  query GetMenu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      handle
      items {
        id
        title
        url
        type
        items {
          id
          title
          url
          type
          items {
            id
            title
            url
            type
          }
        }
      }
    }
  }
`;
