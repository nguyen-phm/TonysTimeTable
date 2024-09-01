import { useState } from "react";

const Home = () => {

    const [name, setName] = useState("Hello");
    const [list, newList] = useState([
        {title: "Test1", body: "Test", id: 1},
        {title: "Test2", body: "Test", id: 2},
        {title: "Test3", body: "Test", id: 3}
    ]);

    const handleClick = () => {
        setName("I love your cute butt");    
    }

    return (  
        <div className="home">
            <h2>Homepage</h2>
            <p>{ name }</p>
            <button onClick = {handleClick}>Click me</button>
            {list.map((list) => (
                <div className="list-preview" key={list.id}>
                    <h2>{ list.title }</h2>
                    <p>This is a... {list.body}</p>
                </div>
            ))}
        </div>
    );
}
 
export default Home;
<div className="home"></div>