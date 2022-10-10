package myproject;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Alias;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.okta.app.OAuth;
import com.pulumi.okta.app.OAuthArgs;
import com.pulumi.okta.auth.Server;
import com.pulumi.okta.auth.ServerArgs;
import com.pulumi.okta.idp.Oidc;
import com.pulumi.okta.policy.Password;
import com.pulumi.okta.policy.PasswordArgs;
import com.pulumi.okta.user.User;
import com.pulumi.okta.user.UserArgs;
import com.pulumi.resources.CustomResourceOptions;
import com.pulumi.resources.ResourceOptions;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var application = new OAuth("OAtuh_appFinalTest", OAuthArgs.builder()        
            .grantTypes("authorization_code")
            .label("ApplicationName")
            .redirectUris("http://localhost:4200/login/callback")
            .implicitAssignment(true)
            .postLogoutRedirectUris("http://localhost:4200")
            .consentMethod("REQUIRED")
            .grantTypes(new String[]{"authorization_code","refresh_token"})
            .issuerMode("DYNAMIC")
            .tokenEndpointAuthMethod("none")
            .responseTypes("code")
            .type("browser")
            .build());
            /*
            * , CustomResourceOptions.builder()
                        .deleteBeforeReplace(true)
                        .aliases(Alias.builder()
                        .name("example")
                        .build())
                        .build()
            */

            /*
             * , CustomResourceOptions.builder()
            .importId("0oa68ril6auaQg0IC5d7")
            .build()
             */
        var user = new User("UserFinalTest", UserArgs.builder()
            .firstName("Mario")
            .lastName("Rossi")
            .email("emanuele.cisotto@gmail.com")
            .login("mario.rossi.example@okta.com")
            .build());
            /*
             * ,
            CustomResourceOptions.builder()
            .importId("mario.rossi.example@okta.com")
            .build()
             */
        /*var pswrd = new Password("userPassword", PasswordArgs.builder()        
            .description("User_Password")
            //.groupsIncludeds(data.okta_group().everyone().id())
            .passwordHistoryCount(4)
            .status("ACTIVE")
            .build());*/
    }
}
