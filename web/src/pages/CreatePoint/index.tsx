import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/Api'

import Dropzone from '../../components/Dropzone'

import MaskedInput from 'react-text-mask'

import './styles.css'
import logo from '../../assets/logo.svg'
import Modal from '../Shared/Modal';


interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string,

}


interface IBGECityResponse {
    nome: string,

}


const CreatePoint = () => {

    //estados do react
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])


    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [showModal, setShowModal] = useState<boolean>(false);

    const [formData, setFormdata] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    //metodo para pegar a localização pelo gps do navegador
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])


    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    useEffect(() => {

        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        //carregar as cidade quando a uf mudar
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityName = response.data.map(city => city.nome)

            setCities(cityName)
        })

    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectedUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value

        setSelectedCity(city)
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        setFormdata({ ...formData, [name]: value })

    }

    function handleSelecteItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        let { name, email, whatsapp } = formData

        //tratamento da mascara para mandar somente numeros para o BackEnd
        whatsapp = whatsapp.replace(/ /g, '')
        whatsapp = whatsapp.replace('-', '')
        whatsapp = whatsapp.replace(')', '')
        whatsapp = whatsapp.replace('(', '')

        const uf = selectedUf
        const city = selectedCity

        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = new FormData()

        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))

        if (selectedFile) {
            data.append('image', selectedFile)

        }

        await api.post('points', data)

        setShowModal(true);

        setTimeout(function () {
            setShowModal(false);
            history.push('/');
        }, 4000);
    }



    return (
        <div id="page-create-point">
            <header>

                <Link to="/">
                    <img src={logo} alt="Ecoleta" />
                </Link>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>

            </header>


            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Modal show={showModal} />

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} required />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} required />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            {/* <input  name="whatsapp" id="whatsapp" onChange={handleInputChange} />  */}
                            <MaskedInput
                                mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                type="text"
                                // className="form-control"
                                name="whatsapp"
                                placeholder="Digite seu Telefone"
                                guide={false}
                                id="whatsapp"
                                onBlur={() => { }}
                                onChange={handleInputChange}
                                required
                            />
                        </div>



                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick} className="map-leaflet">
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf} >
                                <option value="0">Selecione uma UF</option>

                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>

                                ))}

                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>

                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>

                    </legend>
                    <ul className='items-grid'>
                        {items.map(item => (
                            <li
                                key={item.id}

                                onClick={() => handleSelecteItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}


                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint