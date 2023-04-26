import { createContext, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext({} as any);

export const UserStorage = ({children} : any) => {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState(localStorage.getItem('token') as string)
  const navigate = useNavigate()
  
  const getUser = (token: string) => {
    api.get('/user/get-user', {headers: {Authorization: token}}).then(({ data }) => {
      setUser(data.user);
      setLogin(true);
    }).catch((error) => {
      console.log('usuário não autenticado', error)
    })
  }

  useEffect(() => {
    getUser(token)
  },[token])

  const logOut = () => {
    localStorage.removeItem('token');
    setLogin(false);
    setUser({});
  }
  
  
  const handleLogin = (email: string, password: string) => {
    api.post('/user/sign-in', {email, password}).then(({ data }) => {
      setLogin(true);
      localStorage.setItem('token', data.token);
      setToken(data.token)
      getUser(data.token);
      navigate('/')
    }).catch((error) => {
      console.log('Não foi possível fazer o login', error);
      alert('Usuário ou senha incorretos. Verifique os dados e tente novamente.')
    })
  }

  const handleCreateUser = (name: string, email: string, password: string) => {
    api.post('/user/sign-up', {name, email, password}).then(() => {
      alert('Cadastrado realizado com sucesso')
      handleLogin(email, password);
      navigate('/')
    }).catch((error) => {
      console.log('Não foi possível criar novo usuário', error);
      if (error.response.status === 409) { // 409 é o status de conflito para email já existente
        alert('Este e-mail já está em uso. Por favor, tente outro.');
      } else {
        alert('Não foi possível criar o usuário. Verifique os dados e tente novamente.');
      }
    })
  }
  

  return (
    <UserContext.Provider value={{
      login,
      user,
      handleLogin,
      handleCreateUser,
      logOut
    }}>
      {children}
    </UserContext.Provider>
  )
}