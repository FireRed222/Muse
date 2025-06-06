import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useStore } from '../store/useStore';


const ReFetchData = () => {
  const { fetchDataById, currentId, setCurrentId } = useStore();

  const { isLoading, error, data } = useQuery({
    queryKey: ['product'],
    queryFn: () => fetchDataById('https://dummyjson.com/products', currentId),
    refetchInterval: 100,
  });

  if (isLoading) return <h1>"Loading..."</h1>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>ID:  {data.id} </h2>
      <p>Brand: {data.brand} </p>
      <button type="button" onClick={setCurrentId}>Next ToDo</button>
    </div>
  );
};

export default ReFetchData;
