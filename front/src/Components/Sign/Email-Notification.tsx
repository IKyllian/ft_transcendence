import { IconMailForward } from "@tabler/icons";
import EmailImage from "../../Images-Icons/emailSend.png";

function EmailNotification() {
    return (
        <div className="sign-container">
            <div className="email-notification-wrapper">
                <IconMailForward />
                <h3> Email Confirmation </h3>
                <p> An email has been send to <span>blabla@gmail.com</span> to confirm your account </p>
            </div>
        </div>
    );
}

export default EmailNotification;