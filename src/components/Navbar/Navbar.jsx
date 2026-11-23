import Logo from '../../assets/logo.png';
import './Navbar.scss';
import { NavLink } from "react-router-dom";
import { useContext, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { Menu, Close } from '@mui/icons-material';

const Navbar1 = () => {
    const { currentUser } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setMenuOpen(false);
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="glass-navbar">
            <div className="navbar-container">
                <NavLink to="/" className='logo' onClick={closeMenu}>
                    <img src={Logo} alt='kdan_logo' />
                </NavLink>
                <button
                    className="menu-toggle"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <Close /> : <Menu />}
                </button>
                <nav className={menuOpen ? "open" : ""}>
                    <NavLink to="/" title='home' onClick={closeMenu}>Home</NavLink>
                    <NavLink to="/about" title='about-us' onClick={closeMenu}>About</NavLink>
                    <NavLink to="/pay" title='vip-subscription' onClick={closeMenu}>Get VIP</NavLink>
                    {currentUser &&
                        <NavLink to="/users-edit" title='my-profile' onClick={closeMenu}>My Profile</NavLink>
                    }
                    <div className="btn-wrapper">
                        {currentUser ?
                            <NavLink className="glass-btn" onClick={handleLogout} title='signout'>Logout</NavLink> :
                            <NavLink className="glass-btn" to="/login" title='login'>Log In</NavLink>
                        }
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Navbar1;
