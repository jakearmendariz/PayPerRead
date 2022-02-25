import React from 'react';

import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

export {
  Row,
  Column,
};
