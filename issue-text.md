issue title: Consider adding automatic validation for the citation metadata

Hello!

I noticed that your repository is using the Citation File Format to store citation metadata in `CITATION.cff`. Did you know that you can automate validation of that file using the [cffconvert GitHub Action](https://github.com/marketplace/actions/cffconvert)? That way, it's a little bit easier to be robust against future changes to the `CITATION.cff` file.

If you're interested, I can make a Pull Request that adds the cffconvert GitHub Action to your repository.
