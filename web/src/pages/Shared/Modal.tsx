import React from 'react';
import { FiCheckCircle, FiCheck } from 'react-icons/fi';
import { Link} from 'react-router-dom'


import './modal.css';

const Modal: React.FC<{ show: boolean }> = ({ show }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";

    return (
        <div className={showHideClassName}>
            <div className="modal-main" tabIndex={0}>
                <span>
                    <FiCheckCircle color="#34CB79" size="60" />
                </span>
                <br/> <br/>

                <h1>
                    Cadastro concluído!
                </h1>

                <br/><br/>

                <div>
                    <span>
                        <Link to="/create-point" onClick={() => window.location.reload()}>
                           <FiCheck color="#34CB79" size="15" />
                            
                           <span> Cadastrar um novo ponto</span>
                        </Link>
                    </span>

                </div>
            </div>
        </div>

    );
}

export default Modal;