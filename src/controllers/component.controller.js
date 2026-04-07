const db = require('../db/database');
const path = require('path');
const fs = require('fs');

const getAll = (req, res) => {
    try {
        const { rack_id } = req.query;
        let components;
        
        if (rack_id) {
            const stmt = db.prepare('SELECT * FROM components WHERE rack_id = ? ORDER BY created_at DESC');
            components = stmt.all(rack_id);
        } else {
            const stmt = db.prepare('SELECT * FROM components ORDER BY created_at DESC');
            components = stmt.all();
        }
        
        res.status(200).json({ message: "success", data: components });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getById = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM components WHERE id = ?');
        const component = stmt.get(id);
        
        if (!component) {
            return res.status(404).json({ message: "Component not found." });
        }
        
        res.status(200).json({ message: "success", data: component });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getPdf = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT pdf_path FROM components WHERE id = ?');
        const component = stmt.get(id);
        
        if (!component) {
            return res.status(404).json({ message: "Component not found." });
        }
        
        if (!component.pdf_path) {
            return res.status(404).json({ message: "No PDF available for this component." });
        }
        
        // Resolve absolute path assuming pdf_path is relative to the project root
        const rootDir = process.cwd();
        const absolutePath = path.resolve(rootDir, component.pdf_path);
        
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: "PDF file not found on server." });
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(absolutePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const create = (req, res) => {
    try {
        const { rack_id, name, type, serial_number, pdf_path, description } = req.body;
        
        if (!rack_id || !name) {
            return res.status(400).json({ message: "rack_id and name are required." });
        }
        
        const rackExists = db.prepare('SELECT id FROM racks WHERE id = ?').get(rack_id);
        if (!rackExists) {
            return res.status(400).json({ message: "Referenced rack does not exist." });
        }
        
        const stmt = db.prepare(`
            INSERT INTO components (rack_id, name, type, serial_number, pdf_path, description) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            rack_id, name, type || null, serial_number || null, pdf_path || null, description || null
        );
        
        const newComponent = db.prepare('SELECT * FROM components WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json({ message: "Component created successfully", data: newComponent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const update = (req, res) => {
    try {
        const { id } = req.params;
        const { rack_id, name, type, serial_number, pdf_path, description } = req.body;
        
        const componentExists = db.prepare('SELECT id FROM components WHERE id = ?').get(id);
        if (!componentExists) {
            return res.status(404).json({ message: "Component not found." });
        }
        
        if (rack_id) {
            const rackExists = db.prepare('SELECT id FROM racks WHERE id = ?').get(rack_id);
            if (!rackExists) {
                return res.status(400).json({ message: "Referenced rack does not exist." });
            }
        }
        
        // Check undefined vs null to allow nulling fields
        const currRackId = rack_id !== undefined ? rack_id : null;
        const currName = name !== undefined ? name : null;
        const currType = type !== undefined ? type : null;
        const currSerialNumber = serial_number !== undefined ? serial_number : null;
        const currPdfPath = pdf_path !== undefined ? pdf_path : null;
        const currDescription = description !== undefined ? description : null;

        const stmt = db.prepare(`
            UPDATE components 
            SET rack_id = COALESCE(?, rack_id), 
                name = COALESCE(?, name), 
                type = COALESCE(?, type), 
                serial_number = COALESCE(?, serial_number), 
                pdf_path = COALESCE(?, pdf_path), 
                description = COALESCE(?, description), 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        
        stmt.run(currRackId, currName, currType, currSerialNumber, currPdfPath, currDescription, id);
        
        const updatedComponent = db.prepare('SELECT * FROM components WHERE id = ?').get(id);
        res.status(200).json({ message: "Component updated successfully", data: updatedComponent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

const remove = (req, res) => {
    try {
        const { id } = req.params;
        
        const stmt = db.prepare('DELETE FROM components WHERE id = ?');
        const info = stmt.run(id);
        
        if (info.changes === 0) {
            return res.status(404).json({ message: "Component not found." });
        }
        
        res.status(200).json({ message: "Component deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getAll, getById, getPdf, create, update, remove };
