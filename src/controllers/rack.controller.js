const db = require('../db/database');

const getAll = (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM racks ORDER BY created_at DESC');
        const racks = stmt.all();
        res.status(200).json({ message: "success", data: racks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getById = (req, res) => {
    try {
        const { id } = req.params;
        const rackStmt = db.prepare('SELECT * FROM racks WHERE id = ?');
        const rack = rackStmt.get(id);
        
        if (!rack) {
            return res.status(404).json({ message: "Rack not found." });
        }
        
        const compStmt = db.prepare('SELECT * FROM components WHERE rack_id = ?');
        const components = compStmt.all(id);
        
        rack.components = components;
        res.status(200).json({ message: "success", data: rack });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const create = (req, res) => {
    try {
        const { name, location, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Name is required." });
        }
        
        const stmt = db.prepare('INSERT INTO racks (name, location, description) VALUES (?, ?, ?)');
        const info = stmt.run(name, location || null, description || null);
        
        const newRack = db.prepare('SELECT * FROM racks WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json({ message: "Rack created successfully", data: newRack });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const update = (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, description } = req.body;
        
        const rackExists = db.prepare('SELECT id FROM racks WHERE id = ?').get(id);
        if (!rackExists) {
            return res.status(404).json({ message: "Rack not found." });
        }
        
        const currentName = name !== undefined ? name : null;
        const currentLocation = location !== undefined ? location : null;
        const currentDescription = description !== undefined ? description : null;

        const stmt = db.prepare(`
            UPDATE racks 
            SET name = COALESCE(?, name), 
                location = COALESCE(?, location), 
                description = COALESCE(?, description), 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        stmt.run(currentName, currentLocation, currentDescription, id);
        
        const updatedRack = db.prepare('SELECT * FROM racks WHERE id = ?').get(id);
        res.status(200).json({ message: "Rack updated successfully", data: updatedRack });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const remove = (req, res) => {
    try {
        const { id } = req.params;
        
        const stmt = db.prepare('DELETE FROM racks WHERE id = ?');
        const info = stmt.run(id);
        
        if (info.changes === 0) {
            return res.status(404).json({ message: "Rack not found." });
        }
        
        res.status(200).json({ message: "Rack deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getAll, getById, create, update, remove };
