import React, { useState } from "react";
import { Form, Dropdown, InputGroup } from "react-bootstrap";
import axios from "axios";
import { Link } from "@inertiajs/react";

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const handleSearch = async (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length > 2) {
            const { data } = await axios.get(`/api/assets/search?name=${e.target.value}`);
            setSuggestions(data);
        } else {
            setSuggestions([]);
        }
    };

    return (
        <InputGroup className="mb-3">
            <Form.Control
                type="text"
                placeholder="Search for assets..."
                value={searchTerm}
                onChange={handleSearch}
            />
            {suggestions.length > 0 && (
                <Dropdown.Menu show>
                    {suggestions.map((asset) => (
                        <Dropdown.Item as={Link} href={`/assets/${asset.id}`} key={asset.id}>
                            {asset.name}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            )}
        </InputGroup>
    );
};

export default SearchBar;
