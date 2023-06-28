# PostForward
## Routes
> **Note**
> Log servers will only log the HEAD part of the JSON to prevent leaking any important data

See what body you need to use when POSTing <br>
[POST, GET] https://145.24.222.51:8443/api/v1/expected

The router URL, use POST on this link with the JSON body in order to target a country and bank <br>
[POST] https://145.24.222.51:8443/api/v1/route-data

Forwarder's log server <br>
[GET] https://145.24.222.51:8443/online-log/view/

Receiver's log server <br>
[GET] http://145.24.222.51:8082/online-log/view/

## JSON Body
> **Warning**
> If you set a value like 'Ctry' make sure to capitalize the U and K

> **Note**
> 'from' and 'to' headers are allowed to be the same. As long as you correctly use this template you should get an OK as response.

```ruby
{
  "head": {
    "fromCtry": "YourCountry",
    "fromBank": "YourBank", 
    "toCtry": "TargetCountry",
    "toBank": "TargetBank"
  },
  "body": {
    # Whatever data you like to pass, en example is:
    "pin": 1234
  }
}
```
