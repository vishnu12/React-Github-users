import React, { useState, useEffect,createContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext=createContext();

const GithubProvider=(props)=>{
    const [githubUser,setGithubUser]=useState(mockUser)
    const [repos,setRepos]=useState(mockRepos)
    const [followers,setFollowers]=useState(mockFollowers)
//request loading
const [request,setRequest]=useState(0);
const [loading,setLoading]=useState(false)
//errors
const [error,setError]=useState({show:false,msg:''})

const searchUser= async (user)=>{
    //toggle error
toggleError(false,'')
    //setloading(true)
    setLoading(true)
    const response =await axios.get(`${rootUrl}/users/${user}`)
    .catch(err=>console.log(err))
    console.log(response)
    if(response){
        setGithubUser(response.data)
       const {login,followers_url}=response.data;
     /*axios(`${rootUrl}/users/${login}/repos?per_page=100`)
     .then(res=>setRepos(res.data))

     axios(`${followers_url}?per_page=100`)
     .then(res=>setFollowers(res.data))*/

     await Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`),
     axios(`${followers_url}?per_page=100`)])
     .then(result=>{
         setRepos(result[0].value.data)
         setFollowers(result[1].value.data)
     })
     .catch(err=>console.log(err))

        
    }else{
        toggleError(true,'there is no such user')
    }
     
    checkRequest();
    setLoading(false);
}
//check rate
const checkRequest=()=>{
    axios.get(`${rootUrl}/rate_limit`)
    .then(({data})=>{
        console.log(data)
        let {rate:{remaining}}=data;
        setRequest(remaining);
        if(remaining ===0){
            //throw error
            toggleError(true,'sorry,you have exceded the limit of requests per hour')
        }
    })
    .catch(err=>console.log(err))
}

const toggleError=(show,msg)=>{
    setError({
        show,
        msg
    })
}
//error
useEffect(checkRequest,[])
    return(
        <GithubContext.Provider value={{
            githubUser,
            repos,
            followers,
            request,
            error,
            searchUser,
            loading
        }}>
            {props.children}
        </GithubContext.Provider>
    )
}

export {GithubContext,GithubProvider}