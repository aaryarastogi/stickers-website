import React from "react"
import { Route, Routes } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import Cart from "./Components/Cart"
import Login from "./Pages/Login"
import SignUp from "./Pages/SignUp"
import Main from "./Pages/Main"
import CreateStickers from "./Pages/CreateStickers"
import Stickers from "./Pages/Stickers"
import CustomStickerCreator from "./Pages/CustomStickerCreator"
import AIStickerGenerator from "./Pages/AIStickerGenerator"

function App() {
  return (
  <CartProvider>
    <div className="bg-white">
      <Routes>
        <Route path="/" element={<Main/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<SignUp/>}></Route>
        <Route path='/createstickers' element={<CreateStickers/>}></Route>
        <Route path='/stickers' element={<Stickers/>}></Route>
        <Route path='/custom-sticker-creator' element={<CustomStickerCreator/>}></Route>
        <Route path='/ai-sticker-generator' element={<AIStickerGenerator/>}></Route>
      </Routes>
      <Cart />
    </div>
  </CartProvider>
  )
}

export default App