import React, { useState } from 'react';
import { PayPerRead } from './PayPerRead';

import styled from 'styled-components';

const Outter = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`
const Inner = styled.div`
    background-color: white;
    width: 80%;
    font-size: 1.2rem;
    max-width: 800px;
    @media (max-width: 1200px) {
        width: 100%;
    }
`
const Title1 = styled.h1`
    font-size: 2.5rem;
`
const Title2 = styled.h1`
    font-size: 2rem;
`
const Text = styled.p`

`
const SubText = styled.p`
    color: grey
`
const Spacer = ({ height }) => (
    <div style={{ height: height }} />
)
const Img = styled.img`
    width: 80%;
    height: auto
`
const Center = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
`
const PaywallBlur = styled.div`
    filter: blur(5px);
    user-select: none;
    pointer-events: none;
`
const PaywallWrapper = styled.div`
    padding: 35px;
    border-radius: 5px;
    position: relative;
    margin-bottom: 30px;
    box-shadow: 0px 0px 20px -1px rgba(0,0,0,0.20);
    text-align: center;
    min-width: 500px;
`
const PaywallTitle1 = styled.h1`
    font-size: 2rem;
`
const PaywallTitle2 = styled.h1`
    font-size: 1.7rem;
    font-weight: 400
`
const PaywallText = styled.p`
    font-size: 1.5rem;
`
const SubCardWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: center
`
const SubCard = styled.div`
    margin: 1rem;
    border: 1px solid #e1e1e3;
    padding: 1rem;
    width: 15rem;
`
const SubButton = styled.button`
    border: 1px solid grey;
    background-color: white;
    color: black;
    &:hover {
        background-color: black;
        color: white
    }
`

const IconButton = styled.button`
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
    border-radius: 50%;
    border: 0;
    background-color: black;
    height: 40px;
    width: 40px;
    color: white;
    transition: all .2s ease-in-out;
    &:hover {
        transform: scale(1.2);
    }
`
const PayPerReadIcon = ({ onClick }) => {
    return (
        <IconButton title="PayPerRead" onClick={onClick}>
            <i className="fab fa-pushed" />
        </IconButton>
    )
}

function Paywall({ children }) {
    const [showArticle, setShowArticle] = useState(false);
    const [showIframe, setShowIframe] = useState(false);

    if (showArticle) return children;

    return (
        <>
            <PaywallWrapper style={{ display: showArticle ? "none" : "inherit" }}>
                <PaywallTitle1>Subscribe Today</PaywallTitle1>
                <PaywallText>Gain access to all the articles on our platform by purchasing a subscription.</PaywallText>
                <SubCardWrapper>
                    <SubCard>
                        <PaywallTitle2>Monthly</PaywallTitle2>
                        <PaywallText style={{ fontWeight: "bold" }}>$19.99</PaywallText>
                        <SubButton>Purchase</SubButton>
                    </SubCard>
                    <SubCard>
                        <PaywallTitle2>Yearly</PaywallTitle2>
                        <PaywallText style={{ fontWeight: "bold" }}>$199.99</PaywallText>
                        <SubButton>Purchase</SubButton>
                    </SubCard>
                </SubCardWrapper>
                <div>Alternatives</div>
                <Spacer height="0.5rem" />
                <Center>
                    <PayPerRead
                        publisherEmail={"xyan87@ucsc.edu"}
                        articleId={"weqEX323ujemE23"}
                        showArticle={showArticle}
                        setShowArticle={setShowArticle}
                        show={showIframe}
                    />
                    {showIframe ?
                        <></> :
                        <PayPerReadIcon onClick={() => setShowIframe(true)} />
                    }

                </Center>
            </PaywallWrapper>
            <PaywallBlur>
                {children}
            </PaywallBlur>
        </>
    )
}

const ArticleContents = () => (
    <Outter>
        <Inner>
            <Title1>Very Interesting Article</Title1>
            <SubText>By Someone @ foo.bar.dev</SubText>
            <Spacer height="1rem" />
            <Text>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Text>
            <Paywall>
                <Text>
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
                </Text>
                <Center style={{ margin: "1rem 0" }}>
                    <Img src="https://n1s1.hsmedia.ru/c3/28/10/c328105a9a820d3c6ff036c69d8bab1f/2120x1414_0xac120003_10609530771625864395.jpg" />
                </Center>
                <Text>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.
                </Text>
                <Spacer height="1rem" />
                <Title2>Part I ⚡</Title2>
                <Text>
                    Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero.
                </Text>
                <Text>Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. </Text>
                <Spacer height="1rem" />
                <Title2>Part II 😎</Title2>
                <Text>Nullam semper dui vitae leo accumsan gravida. Praesent dolor justo, consequat vitae massa sed, scelerisque volutpat risus. Etiam id felis ut ipsum blandit tempor. Integer mattis lacus nec mollis lobortis. Morbi enim urna, eleifend in dui eu, imperdiet placerat enim. Nunc hendrerit massa at enim lobortis eleifend. Nullam laoreet pellentesque pulvinar. Curabitur diam lorem, egestas et odio id, pellentesque rhoncus mi. Donec in orci a ex facilisis faucibus ac ac odio. Suspendisse potenti. Proin lacinia, quam ac viverra vehicula, odio nibh consectetur metus, id mattis est mauris rutrum eros. Pellentesque venenatis, nulla eget malesuada euismod, erat nisi viverra libero, eget sagittis quam ligula vitae nunc. Curabitur laoreet arcu enim, et sagittis risus elementum fringilla.</Text>
                <Text>Duis consequat vehicula mi, non tempus diam finibus vel. In a magna sagittis, vehicula sapien sit amet, pellentesque nisl. Ut porta eros ac sapien euismod scelerisque. Suspendisse potenti. Ut faucibus, nibh quis commodo tincidunt, tortor leo efficitur nibh, et porta purus sem nec massa. Mauris urna turpis, varius eu lacinia vitae, pretium non lorem. Nulla a erat nunc. Fusce vel placerat velit. Suspendisse ornare neque vitae sem aliquam ultricies. Curabitur vel tortor fringilla, cursus lectus at, maximus ex. Aenean leo ex, blandit a suscipit sit amet, varius a tellus. Mauris elementum leo eget placerat laoreet. Vivamus ac pretium nisl.</Text>
                <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros ex. Suspendisse aliquam interdum ornare. Duis euismod lorem vitae tortor pharetra, sed rhoncus dui tincidunt. Nam sed justo et magna aliquet cursus a vitae ligula. Praesent rutrum, sapien non fermentum efficitur, ligula quam euismod urna, scelerisque eleifend nunc ipsum in mi. Donec tempus lacus dui, eget interdum felis condimentum non. Nulla dictum, purus a iaculis consectetur, enim risus rutrum lorem, a accumsan nibh dolor eu arcu. Cras velit est, gravida vitae ligula vel, congue rhoncus nisi. Duis efficitur sed turpis vel lobortis.</Text>
            </Paywall>
            <Spacer height="10rem" />
        </Inner>
    </Outter>
);

function ThirdArticle() {
    // Keeping this outside of the PayPerRead component 
    // in case the publisher wants to show additional components
    // like a model after purchasing.

    return (
        <div>
            <ArticleContents />
        </div>
    );
}

export default ThirdArticle;
