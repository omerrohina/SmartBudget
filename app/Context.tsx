import React, { useState, createContext } from 'react';

const Context = createContext();

export const CounterProvider = ({children}) => {
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(count +1);
    };
    return (
        <Context.Provider value={{count, increment}}>
        {children}
        </Context.Provider>
    );
};

export default Context;
