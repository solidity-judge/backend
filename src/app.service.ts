import { Injectable } from '@nestjs/common';
import keccak256 from 'keccak256';
const solc = require('solc');

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello World!';
    }

    compile(source: string) {
        const contractFile = 'contract.sol';
        const input = {
            language: 'Solidity',
            sources: {
                'contract.sol': {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['evm.bytecode'],
                    },
                },
            },
        };
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        const allErrors: {
            severity: string;
            formattedMessage: string;
            errorCode: string;
        }[] = output['errors'] ?? [];

        const errors = allErrors.filter((x) => x.severity === 'error');

        if (errors.length > 0) {
            return {
                bytecode: '',
                hash: '',
                errors: errors.map((x) => {
                    return {
                        msg: x.formattedMessage,
                        code: x.errorCode,
                    };
                }),
            };
        }

        for (const contractName in output.contracts[contractFile]) {
            const bytecode =
                '0x' +
                output.contracts[contractFile][contractName].evm.bytecode
                    .object;
            const hash = keccak256(bytecode).toString('hex');
            return {
                bytecode,
                hash,
                errors: [],
            };
        }
        return {
            bytecode: '',
            hash: '',
            errors: [
                { msg: 'Compilation failed - no contract found', code: '69' },
            ],
        };
    }
}
