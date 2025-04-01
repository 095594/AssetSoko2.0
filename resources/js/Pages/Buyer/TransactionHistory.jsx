import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BuyerLayout from '../../Layouts/BuyerLayout';
import { Card, Table } from 'react-bootstrap';

const TransactionsIndex = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Fetch transactions from the API
        axios.get('/api/transactions', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(response => setTransactions(response.data))
        .catch(error => console.error(error));
    }, []);

    return (
        <BuyerLayout>
            <h1>Transaction History</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Asset</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.auction.asset.name}</td>
                            <td>${transaction.auction.current_bid}</td>
                            <td>{transaction.payment_status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </BuyerLayout>
    );
};

export default TransactionsIndex;