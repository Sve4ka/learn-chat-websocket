// App.tsx (роутинг)
import { Route, Routes, Navigate} from 'react-router-dom';
import Login from './Login';
import UserProfile from './UserProfile';
import Chat from './Chat';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/profile" element={<UserProfile/>}/>
            <Route path="/chat" element={<Chat/>}/>
        </Routes>
    );
};

export default App;