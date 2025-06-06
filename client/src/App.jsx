import React from 'react';
import { useStore } from './store/useStore';
import TanStackQuery from './components/TanStackQuery';
import ReFetchData from './components/ReFetchData';
import GetPosts from './components/GetPosts';
import { Link, Route, Routes } from 'react-router-dom';
import GetPostsById from './components/GetPostsById';
import Home from './components/Home/Home';

const App = () => {
  // const {count, inc, dec} = useStore();

  return (
    <>

      

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/posts' element={<GetPosts/>}/>
        <Route path='/posts/:id' element={<GetPostsById/>}/>
      </Routes>

      {/* <div className="app">
        <h1>{count}</h1>
        <button onClick={inc}>+</button>
        <button onClick={dec}>-</button>
        <TanStackQuery/>
        <ReFetchData/>
        <GetPosts />
      </div> */}
    </>
  );
};

export default App;
