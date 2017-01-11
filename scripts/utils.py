# -*- coding: utf-8 -*-


def get_params(url):
    result = {}
    params = url.split("?")[1] if '?' in url else url
    for param in params.split('&'):
        param_splits = param.split('=')
        try:
            result[param_splits[0]] = param_splits[1]
        except IndexError:
            continue
    return result
