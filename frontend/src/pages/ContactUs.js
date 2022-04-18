import { Form, Button } from 'react-bootstrap';
import { buildApiUrl } from '../utils/ApiConfig';

const divStyle = { 
    width: "60%",
    height: "50vh", 
    margin: "auto", 
    alignItems: 'center', 
    float: 'center', 
    padding: '4rem', 
    borderRadius: '25px',
};

const handleSubmit = async (event) => {
    const emailForm = {
        name: event.target[0].value,
        email: event.target[1].value,
        message: event.target[2].value,
    }
    fetch(buildApiUrl('email'), {
        method: 'POST',
        body: JSON.stringify(emailForm),
    });
}

function ContactUs() {
    return (
        <div style={divStyle}>
            <div>
                <h1>Contact Us</h1>
                <p>Want to learn more about our pricing, API or how to get started. Send us an email!</p>
                <Form onSubmit={handleSubmit} style={{ display: 'inline' }}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="name" placeholder="Enter name" />
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" />
                        <Form.Label>Message</Form.Label>
                        <Form.Control as="textarea" rows={3} type="message" placeholder="What are you contacting us about?" />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Send
                    </Button>
                </Form>
            </div>
        </div>
    )
}

export default ContactUs;
