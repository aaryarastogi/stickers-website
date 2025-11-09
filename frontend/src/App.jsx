import React from "react"
import { Route, Routes } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import { CurrencyProvider } from "./context/CurrencyContext"
import Cart from "./Components/Cart"
import Login from "./Pages/Login"
import SignUp from "./Pages/SignUp"
import Main from "./Pages/Main"
import CreateStickers from "./Pages/CreateStickers"
import Stickers from "./Pages/Stickers"
import CustomStickerCreator from "./Pages/CustomStickerCreator"
import AIStickerGenerator from "./Pages/AIStickerGenerator"
import MyOrders from "./Pages/MyOrders"
import Profile from "./Pages/Profile"
import PublicProfile from "./Pages/PublicProfile"
import StickerDetail from "./Pages/StickerDetail"
import PublishSticker from "./Pages/PublishSticker"

function App() {
  return (
  <CurrencyProvider>
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
        <Route path='/my-orders' element={<MyOrders/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
        <Route path='/profile/:username' element={<PublicProfile/>}></Route>
        <Route path='/sticker/:type/:stickerId' element={<StickerDetail/>}></Route>
        <Route path='/publish-sticker' element={<PublishSticker/>}></Route>
        </Routes>
        <Cart />
      </div>
    </CartProvider>
  </CurrencyProvider>
  )
}

export default App