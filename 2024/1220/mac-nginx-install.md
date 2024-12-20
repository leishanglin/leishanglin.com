**安装**

```sh
brew install nginx
```

**启动**

```sh
# 单启动
sudo nginx 

# 开机自启动
brew services start nginx
```

**配置**

```sh
code /user/local/etc/nginx/nginx.conf
```

**重启**

```sh
nginx -s reload
```