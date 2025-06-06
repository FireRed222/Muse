import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useStore } from '../store/useStore';
import { useParams } from 'react-router-dom';


const GetPostsById = () => {
  const { fetchDataById } = useStore();
  const { id } = useParams();


  const { isLoading, error, data } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchDataById('http://localhost:3000/posts', id),
    //   refetchInterval: 100,
  });

  if (isLoading) return <h1>"Loading..."</h1>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>ID: {data.id} </h2>
      <p>Title: {data.title} </p>
      <p>Views: {data.views} </p>
    </div>
  );
};

export default GetPostsById;
