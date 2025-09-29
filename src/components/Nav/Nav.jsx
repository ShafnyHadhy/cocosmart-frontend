import React from 'react'
import './nav.css';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div>
      <ul className='home-ul'>
        <li className='home-ll'>
          <Link to="/plantations" className='home-link'>
            <h1>Plantations</h1>
          </Link>
        </li>
        <li className='home-ll'>
          <Link to="/addplantation" className='home-link'>
            <h1>Add Plantation</h1>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Nav
