import React from 'react';
import GetPosts from './components/GetPosts';
import { Route, Routes } from 'react-router-dom';
import GetPostsById from './components/GetPostsById';
import Home from './components/Home/Home';

const App = () => {

  return (
    <>

      

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/posts' element={<GetPosts/>}/>
        <Route path='/posts/:id' element={<GetPostsById/>}/>
      </Routes>

    </>
  );
};

export default App;
