import { Link } from 'react-router-dom';

function HomeButton(props: {text: string, link: string}) {
    const {text, link} = props;
    
    return (
        <Link to={link} className='home-button'>
            {text}
        </Link> 
    );
}

export default HomeButton;