import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import TeamService from '../services/TeamService';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading teams...');
            const result = await TeamService.getAllTeams();
            console.log('Teams result:', result);

            if (result.success) {
                setTeams(result.data);
            } else {
                setError(result.error || 'Failed to load teams');
            }
        } catch (err) {
            console.error('Error in loadTeams:', err);
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const renderTeam = ({ item }) => (
        <View style={styles.teamCard}>
            <Text style={styles.teamName}>{item.teamName}</Text>
            <Text style={styles.teamInfo}>Leader: {item.teamLeader}</Text>
            <Text style={styles.teamInfo}>Phone: {item.contactPhone}</Text>
            <Text style={styles.teamInfo}>Email: {item.contactEmail}</Text>
            <Text style={[styles.status, { color: item.status === 'Active' ? 'green' : 'red' }]}>
                {item.status}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading teams...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.error}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadTeams}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Maintenance Teams</Text>
            {teams.length > 0 ? (
                <FlatList
                    data={teams}
                    renderItem={renderTeam}
                    keyExtractor={item => item.teamId.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.noTeams}>No teams found</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    listContainer: {
        paddingBottom: 16,
    },
    teamCard: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    teamInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryText: {
        color: 'white',
        fontSize: 16,
    },
    noTeams: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
    },
});

export default Teams; 