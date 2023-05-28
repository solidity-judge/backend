import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

class CompileDto {
    @ApiProperty()
    source: string;
}

class ErrorDto {
    @ApiProperty()
    msg: string;

    @ApiProperty()
    code: string;
}

class CompileResponseDto {
    @ApiProperty()
    bytecode: string;

    @ApiProperty()
    hash: string;

    @ApiProperty({ type: [ErrorDto] })
    errors: ErrorDto[];
}

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('compile')
    @ApiResponse({
        status: 200,
        description: 'Returns result of compilation',
        type: CompileResponseDto,
    })
    compile(@Body() body: CompileDto) {
        return this.appService.compile(body.source);
    }
}
