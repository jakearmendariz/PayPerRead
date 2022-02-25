import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Outter = styled.div`
    padding: 1rem;
    background-color: #fff;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: rgb(0 0 0 / 10%) 0px 1px 2px, rgb(0 0 0 / 8%) 0px 2px 8px;    
`;
const Title = styled.span`
    font-size: 1.3rem;
`;

const Divider = styled.hr`
    border-top: 2px solid #bbb;
    color: #fff;
    margin-top: 0.5rem;
`;

function Card({ children, style, title }) {
  return (
    <Outter style={style}>
      <Title>{title}</Title>
      <Divider />
      {children}
    </Outter>
  );
}

export default Card;
