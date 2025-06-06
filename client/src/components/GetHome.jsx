import React, { Fragment } from 'react'
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const GetHome = () => {
   const { fetchData } = useStore();

   const { isLoading, error, data } = useQuery({
     queryKey: ["home"],
     queryFn: () => fetchData("https://muse-backend-hsdb.onrender.com"),
     staleTime: 60 * 1000,
   })   
   if (isLoading) return <h1>"Loading..."</h1>;
 
   if (error) return <p>Error: {error.message}</p>;
 
   return <div>{data.map((home) => (
    <Fragment key={home.id}>
      <h2>ID: {home.id}</h2>
      <p>Title: {home.title}</p>
      <p>Views: {home.views}</p>
      <Link to={`/posts/${home.id}`}>Click</Link>
    </Fragment>
   ))}</div>;
 };


export default GetHome