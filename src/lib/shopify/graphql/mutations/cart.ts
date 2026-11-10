
export const CREATE_CART_MUTATION = `#graphql
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = `#graphql
  mutation AddToCart(
    $cartId: ID!
    $lines: [CartLineInput!]!
  ) {
    cartLinesAdd(
      cartId: $cartId
      lines: $lines
    ) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CART_MUTATION = `#graphql
  mutation UpdateCart(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
  ) {
    cartLinesUpdate(
      cartId: $cartId
      lines: $lines
    ) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = `#graphql
  mutation RemoveFromCart(
    $cartId: ID!
    $lineIds: [ID!]!
  ) {
    cartLinesRemove(
      cartId: $cartId
      lineIds: $lineIds
    ) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;
