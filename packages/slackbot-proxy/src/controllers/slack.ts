import {
  BodyParams, Controller, Get, Inject, Post, Req, Res,
} from '@tsed/common';
import { Installation } from '~/entities/installation';
import { InstallationRepository } from '~/repositories/installation';

import { InstallerService } from '~/services/InstallerService';

import { supportedSlackCommands } from '../../../slack/src/index';
import { RegisterService } from '../../../slack/src/services/register';

@Controller('/slack')
export class SlackCtrl {

  @Inject()
  installationRepository: InstallationRepository;

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly installerService: InstallerService) {
  }

  @Get('/testsave')
  testsave(): void {
    const installation = new Installation();
    installation.data = {
      team: undefined,
      enterprise: undefined,
      user: {
        id: '',
        token: undefined,
        scopes: undefined,
      },
    };

    this.installationRepository.save(installation);
  }


  @Get('/install')
  async install(): Promise<string> {
    const url = await this.installerService.installer.generateInstallUrl({
      // Add the scopes your app needs
      scopes: [
        'channels:history',
        'commands',
        'groups:history',
        'im:history',
        'mpim:history',
        'chat:write',
      ],
    });

    return `<a href="${url}">`
      // eslint-disable-next-line max-len
      + '<img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />'
      + '</a>';
  }

  @Post('/events')
  handleEvent(@BodyParams() body: any, @Res() res: Res): string {
    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();
    // console.log(supportedSlackCommands);
    const hoge = new RegisterService();
    console.log(hoge.hogeFunction(body));
    // console.log('body', body);

    return 'This action will be handled by bolt service.';
  }

  @Get('/oauth_redirect')
  async handleOauthRedirect(@Req() req: Req, @Res() res: Res): Promise<void> {
    // illegal state
    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    if (req.query.state === '') {
      throw new Error('illegal state');
    }

    return this.installerService.installer.handleCallback(req, res);

    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    // this.installer.handleCallback(req, res, {
    //   success: (installation, metadata, req, res) => {},
    //   failure: (error, installOptions, req, res) => {},
    // });
  }

}
