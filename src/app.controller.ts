import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('compile')
    compile(@Body() body: { source: string }) {
        return this.appService.compile(body.source);
    }
}
