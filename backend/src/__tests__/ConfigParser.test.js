import { jest } from '@jest/globals';
import fs from 'fs';
import yaml from 'js-yaml';
import ConfigParser, { ConfigValidationError } from '../core/ConfigParser.js';

describe('ConfigParser', () => {
    const mockFilePath = '/fake/path/config.yaml';
    let parser;

    beforeEach(() => {
        jest.restoreAllMocks();
        parser = new ConfigParser(mockFilePath);
    });

    it('should throw ConfigValidationError if filePath is missing in constructor', () => {
        expect(() => new ConfigParser()).toThrow(ConfigValidationError);
    });

    it('should load valid YAML correctly', () => {
        const mockConfig = {
            project: { name: 'Test', port: 5000 },
            entities: [{ name: 'User', fields: { name: { type: 'string' } } }]
        };

        const readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('valid yaml content');
        const loadSpy = jest.spyOn(yaml, 'load').mockReturnValue(mockConfig);

        const result = parser.loadYAML();
        expect(result).toEqual(mockConfig);
        expect(readSpy).toHaveBeenCalledWith(mockFilePath, 'utf8');
    });

    it('should throw ConfigValidationError if project.name is missing', () => {
        const invalidConfig = {
            project: { port: 5000 },
            entities: [{ name: 'User' }]
        };

        jest.spyOn(fs, 'readFileSync').mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockReturnValue(invalidConfig);

        expect(() => parser.loadYAML()).toThrow(ConfigValidationError);
        expect(() => parser.loadYAML()).toThrow(/Project 'name' must be a string/);
    });

    it('should throw ConfigValidationError if entities array is empty', () => {
        const invalidConfig = {
            project: { name: 'Test', port: 5000 },
            entities: []
        };

        jest.spyOn(fs, 'readFileSync').mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockReturnValue(invalidConfig);

        expect(() => parser.loadYAML()).toThrow(ConfigValidationError);
        expect(() => parser.loadYAML()).toThrow(/'entities' must be a non-empty array/);
    });

    it('should throw ConfigValidationError if field type is invalid', () => {
        const invalidConfig = {
            project: { name: 'Test', port: 5000 },
            entities: [{
                name: 'User',
                fields: {
                    age: { type: 'invalid-type' }
                }
            }]
        };

        jest.spyOn(fs, 'readFileSync').mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockReturnValue(invalidConfig);

        expect(() => parser.loadYAML()).toThrow(ConfigValidationError);
        expect(() => parser.loadYAML()).toThrow(/has an invalid or missing type/);
    });

    it('should return correct structure via getParsedData()', () => {
        const mockConfig = {
            project: { name: 'Test', port: 5000 },
            entities: [{ name: 'User', fields: { name: { type: 'string' } } }]
        };

        jest.spyOn(fs, 'readFileSync').mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockReturnValue(mockConfig);

        const data = parser.getParsedData();
        expect(data).toHaveProperty('project');
        expect(data).toHaveProperty('entities');
        expect(data.project.name).toBe('Test');
    });
});
