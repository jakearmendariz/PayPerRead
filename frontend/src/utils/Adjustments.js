import React from 'react';

import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  @media (max-width: ${(props) => props.maxWidth}) {
    flex-direction: column;
    align-items: center;
    margin: 0 -1rem;
    justify-content: space-between;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ResponsiveWidth = styled.div`
  width: ${(props) => props.maxWidth};
  @media (max-width: ${(props) => props.maxWidth}) {
    width: 100%;
  }
`;

export {
  Row,
  Column,
  ResponsiveWidth,
};
